import { Request, Response, NextFunction } from 'express'
import { Template } from '../models/template.model'
import { RecipientRole } from '../models/recipientRole.model'
import { SigningOrder } from '../models/signingOrder.model'
import { Field } from '../models/field.model'

// Define a type for the recipient role
interface RecipientRoleInput {
  role: string;
  name: string;
  email: string;
  order?: number;
}

// Create a new template
export const createTemplate = async (
  req: Request & { user?: { id: string; username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  // if (!req.file) {
  //   res.status(400).json({ message: 'No file uploaded' })
  //   return
  // }
   // Check if a documentTemplateUrl is provided in the request body
   let pdfUrl = req.body.documentTemplateUrl;

   // If a new file is uploaded, override the URL with the file's path
   if (req.file) {
     pdfUrl = req.file.path;
   }

   // If neither a file nor a URL is provided, return an error
   if (!pdfUrl) {
     res.status(400).json({ message: "No document provided" });
     return;
   }

  try {
    const recipientRolesArray =
      typeof req.body.recipientRoles === 'string'
        ? JSON.parse(req.body.recipientRoles)
        : req.body.recipientRoles

    const recipientRoleIds = await Promise.all(
      recipientRolesArray.map(
        async (role: RecipientRoleInput) => {
          const recipientRole = new RecipientRole(role)
          await recipientRole.save()
          return recipientRole._id
        }
      )
    )

    // const pdfUrl = req.file.path
    const newTemplate = new Template({
      documentTemplateUrl: pdfUrl,
      createdBy: req.user?.id,
      name: req.body.name,
      description: req.body.description,
      emailSubject: req.body.emailSubject,
      emailMessage: req.body.emailMessage,
      defaultFields: [],
      recipientRoles: recipientRoleIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newTemplate.save()

    // Check if signing order is required (at least one recipient has an `order`)
    const recipientsWithOrder = recipientRolesArray.filter(
      (role: RecipientRoleInput) => typeof role.order === 'number'
    );

    if (recipientsWithOrder.length > 0) {
      await Promise.all(
        recipientRolesArray.map(
          async (role: { order: number }, index: number) => {
            const signingOrder = new SigningOrder({
              templateId: newTemplate._id,
              recipientId: recipientRoleIds[index],
              order: role.order,
              status: 'pending',
            })
            await signingOrder.save()
          }
        )
      )
    }

    res.status(201).json({
      message: 'Template created successfully',
      template: newTemplate,
      createdByUsername: req.user?.username,
    })
  } catch (error) {
    next(error)
  }
}

// Get all templates
export const getTemplates = async (
  req: Request & { user?: { id: string; username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure the user is logged in
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // Find templates created by the logged-in user
    const userTemplates = await Template.find({
      createdBy: req.user.id,
      isDelete: false,
    }).populate('createdBy', 'firstName lastName')

    res.status(200).json({
      message: 'User templates fetched successfully',
      templates: userTemplates,
      requestedByUsername: req.user.username, // Include the username in the response
    })
  } catch (error) {
    next(error)
  }
}

// Get a template by ID
export const getTemplateById = async (
  req: Request & { user?: { username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params

  try {
    const template = await Template.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('recipientRoles')
      .lean()

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    // Conditionally populate defaultFields only if they are available
    if (template.defaultFields && template.defaultFields.length > 0) {
      await Template.populate(template, {
        path: 'defaultFields',
        populate: { path: 'assignedTo', model: 'RecipientRole' },
      })
    }

    res.status(200).json({
      message: 'Template fetched successfully',
      template,
      requestedByUsername: req.user?.username, // Include the username in the response
    })
  } catch (error) {
    next(error)
  }
}

//updated for workflow
export const updateTemplate = async (
  req: Request & { user?: { id: string; username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params

  try {
    // Prepare the updated fields, ensuring each field has required properties
    const updatedFields = await Promise.all(
      (req.body.defaultFields || []).map(async (fieldData: any) => {
        const field = new Field(fieldData)
        await field.save()
        return field._id
      })
    )

    // Update the template document in the database with $set
    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      {
        $set: {
          defaultFields: updatedFields,
          updatedAt: new Date(),
        },
      },
      { new: true } // Return the updated document
    ).populate({
      path: 'defaultFields',
      populate: { path: 'assignedTo', model: 'RecipientRole' },
    })

    if (!updatedTemplate) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    res.status(200).json({
      message: 'Template updated successfully',
      template: updatedTemplate,
    })
  } catch (error) {
    next(error)
  }
}

// Delete a template
export const deleteTemplate = async (
  req: Request & { user?: { username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params

  try {
    const template = await Template.findByIdAndUpdate(
      id,
      { isDelete: true },
      { new: true } // Return the updated document
    )

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    res.status(200).json({
      message: 'Template marked as deleted successfully',
      deletedByUsername: req.user?.username, // Include the username in the response
    })
  } catch (error) {
    next(error)
  }
}

export const getDeletedTemplates = async (
  req: Request & { user?: { id: string; username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Ensure the user is logged in
    if (!req.user?.id) {
      res.status(401).json({ message: 'Unauthorized' })
      return
    }

    // Find templates created by the logged-in user that are marked as deleted
    const deletedTemplates = await Template.find({
      createdBy: req.user.id,
      isDelete: true, // Only fetch templates marked as deleted
    }).populate('createdBy', 'firstName lastName')

    res.status(200).json({
      message: 'Deleted templates fetched successfully',
      templates: deletedTemplates,
      requestedByUsername: req.user.username, // Include the username in the response
    })
  } catch (error) {
    next(error)
  }
}

export const restoreTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params

  try {
    const template = await Template.findByIdAndUpdate(
      id,
      { isDelete: false },
      { new: true }
    )

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    res.status(200).json({
      message: 'Template restored successfully',
      template,
    })
  } catch (error) {
    console.error('Error restoring template:', error)
    next(error)
  }
}

export const permanentDeleteTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params

  try {
    const template = await Template.findByIdAndDelete(id)

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    res.status(200).json({
      message: 'Template permanently deleted',
    })
  } catch (error) {
    console.error('Error permanently deleting template:', error)
    next(error)
  }
}
