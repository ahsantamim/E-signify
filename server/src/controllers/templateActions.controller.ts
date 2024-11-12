import { Request, Response, NextFunction } from 'express'
import { Template } from '../models/template.model'
import { sendEmail } from '../utils/emailService'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import { SigningOrder } from '../models/signingOrder.model'
import { IRecipientRole } from '../types/recipientRole.interface'
import { Field } from '../models/field.model'

// Helper function to overlay signed fields onto the PDF
const fetchAndOverlayFields = async (pdfUrl: string, fields: any[]) => {
  const response = await fetch(pdfUrl)
  const pdfBuffer = await response.arrayBuffer()
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const pages = pdfDoc.getPages()

  for (const field of fields) {
    if (field.value) {
      const page = pages[field.position.page - 1]
      const { width, height } = page.getSize()
      page.drawText(field.value, {
        x: field.position.x,
        y: height - field.position.y,
        size: 12,
        font: await pdfDoc.embedFont(StandardFonts.Helvetica),
        color: rgb(0, 0, 0),
      })
    }
  }

  return await pdfDoc.save()
}

// Add new function to send template to recipients
export const sendTemplate = async (
  req: Request & { user?: { id: string; username: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params

  try {
    const template = await Template.findById(id)
      .populate('recipientRoles')
      .populate('createdBy')

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    let recipient: any

    // Check if only one recipient exists and directly assign
    if (template.recipientRoles.length === 1) {
      recipient = template.recipientRoles[0]
    } else {
      // Get the first pending recipient in the signing order if there are multiple recipients
      const firstRecipientInOrder = await SigningOrder.findOne({
        templateId: template._id,
        status: 'pending',
      })
        .sort({ order: 1 })
        .populate('recipientId')

      if (!firstRecipientInOrder) {
        res.status(400).json({ message: 'No recipients available for signing' })
        return
      }

      recipient = firstRecipientInOrder.recipientId
    }

    // Populate defaultFields only for fields assigned to the designated recipient
    await Template.populate(template, {
      path: 'defaultFields',
      match: { assignedTo: recipient._id }, // Populate only fields for the designated recipient
    })

    // Send an email with the filtered fields
    await sendEmail({
      to: recipient.email,
      subject: template.emailSubject || 'Sign the document',
      html: `
        <p>${template.emailMessage}</p>
        <p>Please click the link below to sign the document:</p>
        <a href="${process.env.CLIENT_URL}/signing/${template._id}?recipient=${recipient._id}">Sign Document</a>
      `,
    })

    res.status(200).json({
      message:
        template.recipientRoles.length === 1
          ? 'Template sent directly to the single recipient'
          : 'Template sent to the first recipient in the signing order',
      recipient: {
        email: recipient.email,
        name: recipient.name,
        fields: template.defaultFields, // Only fields for this recipient are populated
      },
    })
  } catch (error) {
    next(error)
  }
}

// Modify the PDF serving route handler
export const servePdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename } = req.params

    // Since we're using Cloudinary, redirect to the Cloudinary URL
    const template = await Template.findOne({
      documentTemplateUrl: { $regex: new RegExp(filename, 'i') },
    })

    if (!template) {
      res.status(404).json({ message: 'PDF not found' })
      return
    }

    res.redirect(template.documentTemplateUrl)
  } catch (error) {
    console.error('Error serving PDF:', error)
    next(error)
  }
}

// Add this to your existing template.controller.ts

// export const submitSignedTemplate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   const { id: templateId } = req.params
//   const { recipientId, fields } = req.body

//   try {
//     const template = await Template.findById(templateId)
//       .populate({
//         path: 'defaultFields',
//         populate: { path: 'assignedTo', model: 'RecipientRole' },
//       })
//       .populate('recipientRoles')
//       .populate('createdBy')

//     if (!template) {
//       res.status(404).json({ message: 'Template not found' })
//       return
//     }

//     // Update the template fields
//     template.defaultFields = fields
//     template.updatedAt = new Date()
//     await template.save()

//     // If there's only one recipient, mark the template as fully signed
//     if (template.recipientRoles.length === 1) {
//       res.status(200).json({
//         message: 'Document signed successfully by the single recipient',
//       })
//       return
//     }

//     // If there are multiple recipients, proceed with signing order update
//     const signingOrderEntry = await SigningOrder.findOneAndUpdate(
//       { templateId, recipientId },
//       { status: 'signed' },
//       { new: true }
//     )

//     if (!signingOrderEntry) {
//       res.status(404).json({ message: 'Signing order entry not found' })
//       return
//     }

//     // Find the next recipient in the signing order
//     const nextRecipientInOrder = await SigningOrder.findOne({
//       templateId,
//       status: 'pending',
//       order: { $gt: signingOrderEntry.order },
//     })
//       .sort({ order: 1 })
//       .populate('recipientId')

//     if (nextRecipientInOrder) {
//       const nextRecipient = nextRecipientInOrder.recipientId as any
//       await sendEmail({
//         to: nextRecipient.email,
//         subject: template.emailSubject || 'Sign the document',
//         html: `
//           <p>${template.emailMessage}</p>
//           <p>Please click the link below to sign the document:</p>
//           <a href="${process.env.CLIENT_URL}/signing/${template._id}?recipient=${nextRecipient._id}">Sign Document</a>
//         `,
//       })
//     }

//     res.status(200).json({
//       message: 'Document signed successfully',
//       nextRecipient: nextRecipientInOrder
//         ? nextRecipientInOrder.recipientId
//         : null,
//     })
//   } catch (error) {
//     next(error)
//   }
// }

export const submitSignedTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id: templateId } = req.params
  const { recipientId, fields } = req.body

  try {
    const template = await Template.findById(templateId)
      .populate({
        path: 'defaultFields',
        match: { assignedTo: recipientId }, // Populate only fields assigned to this recipient
      })
      .populate('recipientRoles')
      .populate('createdBy')

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    // Update only the designated fields for this recipient
    for (const field of template.defaultFields as any) {
      const signedField = fields.find((f: any) => f.uniqueId === field.uniqueId)
      if (signedField) {
        await Field.findByIdAndUpdate(field._id, { value: signedField.value })
      }
    }

    template.updatedAt = new Date()
    await template.save()

    // If there's only one recipient, mark the template as fully signed
    if (template.recipientRoles.length === 1) {
      res.status(200).json({
        message: 'Document signed successfully by the single recipient',
      })
      return
    }

    // If there are multiple recipients, proceed with signing order update
    const signingOrderEntry = await SigningOrder.findOneAndUpdate(
      { templateId, recipientId },
      { status: 'signed' },
      { new: true }
    )

    if (!signingOrderEntry) {
      res.status(404).json({ message: 'Signing order entry not found' })
      return
    }

    // Find the next recipient in the signing order
    const nextRecipientInOrder = await SigningOrder.findOne({
      templateId,
      status: 'pending',
      order: { $gt: signingOrderEntry.order },
    })
      .sort({ order: 1 })
      .populate('recipientId')

    if (nextRecipientInOrder) {
      const nextRecipient = nextRecipientInOrder.recipientId as any
      await sendEmail({
        to: nextRecipient.email,
        subject: template.emailSubject || 'Sign the document',
        html: `
          <p>${template.emailMessage}</p>
          <p>Please click the link below to sign the document:</p>
          <a href="${process.env.CLIENT_URL}/signing/${template._id}?recipient=${nextRecipient._id}">Sign Document</a>
        `,
      })
    }

    res.status(200).json({
      message: 'Document signed successfully',
      nextRecipient: nextRecipientInOrder
        ? nextRecipientInOrder.recipientId
        : null,
    })
  } catch (error) {
    next(error)
  }
}

// Add this new controller function
export const getTemplateForSigning = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req.params
  const { recipient } = req.query

  try {
    const template = await Template.findById(id)
      .populate({
        path: 'defaultFields',
        populate: { path: 'assignedTo', model: 'RecipientRole' },
      })
      .populate('recipientRoles')
      .populate('createdBy')

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    // Verify if the recipient exists in the template's recipient roles
    const isValidRecipient = template.recipientRoles.some(
      (role: any) => role._id.toString() === recipient
    )

    if (!isValidRecipient) {
      res.status(403).json({ message: 'Invalid recipient' })
      return
    }

    // Filter fields specifically for the recipient
    const fieldsForRecipient = (template.defaultFields as any[]).filter(
      (field: any) => field.assignedTo?._id.toString() === recipient
    )

    // const fieldsForRecipient = template.defaultFields.filter(
    //   (field) => field.assignedTo?.toString() === recipient
    // )

    // Return only necessary data for signing
    res.status(200).json({
      message: 'Template fetched successfully',
      template: {
        _id: template._id,
        name: template.name,
        documentTemplateUrl: template.documentTemplateUrl,
        defaultFields: fieldsForRecipient,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getSentTemplates = async (
  req: Request & { user?: { id: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Simple query to get all templates created by the user
    const templates = await Template.find({ createdBy: req.user?.id })
      .populate('recipientRoles')
      .populate('createdBy')
      .sort({ updatedAt: -1 })

    // Check signing status for each template based on SigningOrder entries
    const templatesWithStatus = await Promise.all(
      templates.map(async (template) => {
        const signingOrders = await SigningOrder.find({
          templateId: template._id,
        })

        // Determine if all signing orders are marked as 'signed'
        const isFullySigned = signingOrders.every(
          (order) => order.status === 'signed'
        )

        // Add signing status to the template
        return {
          ...template.toObject(), // Convert to a plain object to add custom fields
          signingStatus: isFullySigned ? 'Signed' : 'Pending',
        }
      })
    )

    res.json({ templates: templatesWithStatus })
  } catch (error) {
    next(error)
  }
}

// export const downloadSignedTemplate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { id } = req.params
//     const template = await Template.findById(id).populate({
//       path: 'defaultFields',
//       populate: { path: 'assignedTo', model: 'RecipientRole' },
//     })

//     if (!template) {
//       res.status(404).json({ message: 'Template not found' })
//       return
//     }

//     // Fetch the PDF from Cloudinary URL
//     const response = await fetch(template.documentTemplateUrl)
//     const pdfBuffer = await response.arrayBuffer()

//     // Load the PDF document
//     const pdfDoc = await PDFDocument.load(pdfBuffer)
//     const pages = pdfDoc.getPages()

//     // Add fields to the PDF
//     for (const field of template.defaultFields as any[]) {
//       if (field.value) {
//         const page = pages[field.position.page - 1]
//         const { width, height } = page.getSize()

//         page.drawText(field.value, {
//           x: field.position.x,
//           y: height - field.position.y,
//           size: 12,
//           font: await pdfDoc.embedFont(StandardFonts.Helvetica),
//           color: rgb(0, 0, 0),
//         })
//       }
//     }

//     // Save the modified PDF
//     const modifiedPdfBytes = await pdfDoc.save()

//     // Send the PDF as response
//     res.setHeader('Content-Type', 'application/pdf')
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="signed-${template.name}.pdf"`
//     )
//     res.send(Buffer.from(modifiedPdfBytes))
//   } catch (error) {
//     next(error)
//   }
// }

//
//
//
//
//works for multple user not for single
// export const downloadSignedTemplate = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     const { id } = req.params

//     // Fetch the template and populate fields and assigned recipients
//     const template = await Template.findById(id).populate({
//       path: 'defaultFields',
//       populate: { path: 'assignedTo', model: 'RecipientRole' },
//     })

//     if (!template) {
//       res.status(404).json({ message: 'Template not found' })
//       return
//     }

//     // Fetch the signing orders for this template
//     const signingOrders = await SigningOrder.find({ templateId: template._id })

//     // Fetch the PDF from Cloudinary URL
//     const response = await fetch(template.documentTemplateUrl)
//     const pdfBuffer = await response.arrayBuffer()

//     // Load the PDF document
//     const pdfDoc = await PDFDocument.load(pdfBuffer)
//     const pages = pdfDoc.getPages()
//     const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

//     // Iterate through each signing order to handle each recipient's fields
//     for (const order of signingOrders) {
//       const recipientId = order.recipientId.toString()

//       // Get fields assigned to this recipient with non-empty values
//       const fieldsForRecipient = template.defaultFields.filter(
//         (field: any) =>
//           field.assignedTo?._id.toString() === recipientId && field.value
//       )

//       console.log(
//         `Drawing fields for recipient ${recipientId}:`,
//         fieldsForRecipient
//       )

//       // Draw each field’s value on the corresponding PDF page
//       for (const field of fieldsForRecipient as any[]) {
//         if (field.position && field.position.page <= pages.length) {
//           const page = pages[field.position.page - 1]
//           const { height } = page.getSize()

//           console.log(`Drawing field on page ${field.position.page}:`, {
//             text: field.value,
//             position: { x: field.position.x, y: height - field.position.y },
//           })

//           page.drawText(field.value, {
//             x: field.position.x,
//             y: height - field.position.y,
//             size: 12,
//             font,
//             color: rgb(0, 0, 0),
//           })
//         }
//       }
//     }

//     // Save the modified PDF
//     const modifiedPdfBytes = await pdfDoc.save()

//     // Send the modified PDF as a response
//     res.setHeader('Content-Type', 'application/pdf')
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename="signed-${template.name}.pdf"`
//     )
//     res.send(Buffer.from(modifiedPdfBytes))
//   } catch (error) {
//     console.error('Error generating signed PDF:', error)
//     next(error)
//   }
// }

//try nov8
export const downloadSignedTemplate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params

    // Fetch the template and populate fields and assigned recipients
    const template = await Template.findById(id).populate({
      path: 'defaultFields',
      populate: { path: 'assignedTo', model: 'RecipientRole' },
    })

    if (!template) {
      res.status(404).json({ message: 'Template not found' })
      return
    }

    // Fetch the signing orders for this template
    const signingOrders = await SigningOrder.find({ templateId: template._id })

    // Fetch the PDF from Cloudinary URL
    const response = await fetch(template.documentTemplateUrl)
    const pdfBuffer = await response.arrayBuffer()

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer)
    const pages = pdfDoc.getPages()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Determine if signing orders exist or if there's only one recipient
    if (signingOrders.length > 0) {
      // Iterate through each signing order to handle each recipient's fields
      for (const order of signingOrders) {
        const recipientId = order.recipientId.toString()

        // Get fields assigned to this recipient with non-empty values
        const fieldsForRecipient = template.defaultFields.filter(
          (field: any) =>
            field.assignedTo?._id.toString() === recipientId && field.value
        )

        // Draw each field’s value on the corresponding PDF page
        for (const field of fieldsForRecipient as any[]) {
          if (field.position && field.position.page <= pages.length) {
            const page = pages[field.position.page - 1]
            const { height } = page.getSize()

            page.drawText(field.value, {
              x: field.position.x,
              y: height - field.position.y,
              size: 12,
              font,
              color: rgb(0, 0, 0),
            })
          }
        }
      }
    } else {
      // Handle case for a single recipient or no signing order
      const fieldsForRecipient = template.defaultFields.filter(
        (field: any) => field.value
      )

      // Draw each field’s value on the corresponding PDF page
      for (const field of fieldsForRecipient as any[]) {
        if (field.position && field.position.page <= pages.length) {
          const page = pages[field.position.page - 1]
          const { height } = page.getSize()

          page.drawText(field.value, {
            x: field.position.x,
            y: height - field.position.y,
            size: 12,
            font,
            color: rgb(0, 0, 0),
          })
        }
      }
    }

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save()

    // Send the modified PDF as a response
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="signed-${template.name}.pdf"`
    )
    res.send(Buffer.from(modifiedPdfBytes))
  } catch (error) {
    console.error('Error generating signed PDF:', error)
    next(error)
  }
}

export const toggleFavorite = async (
  req: Request & { user?: { id: string } },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const template = await Template.findOne({
      _id: id,
      createdBy: req.user?.id, // Ensure the template belongs to the user
    })

    if (!template) {
      res.status(404).json({ message: 'Template not found or unauthorized' })
      return
    }

    // Toggle the favorite status
    template.isFavorite = !template.isFavorite
    await template.save()

    res.status(200).json({
      message: 'Template favorite status updated successfully',
      isFavorite: template.isFavorite,
      templateId: template._id,
    })
  } catch (error) {
    next(error)
  }
}
export const getInboxTemplates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const email = req.query.email

    if (!email) {
      res.status(400).json({ message: 'Email is required' })
      return
    }

    const templates = await Template.find()
      .populate({
        path: 'recipientRoles',
        match: { email: email }, // Filter based on the email
      })
      .populate('createdBy')
      .sort({ updatedAt: -1 })

    const filteredTemplates = templates.filter(
      (template) => template.recipientRoles.length > 0
    )
    // Check signing status for each template based on SigningOrder entries
    const templatesWithStatus = await Promise.all(
      filteredTemplates.map(async (template) => {
        const signingOrders = await SigningOrder.find({
          templateId: template._id,
        })

        // Determine if all signing orders are marked as 'signed'
        const isFullySigned = signingOrders.every(
          (order) => order.status === 'signed'
        )

        // Add signing status to the template
        return {
          ...template.toObject(), // Convert Mongoose document to plain object
          signingStatus: isFullySigned ? 'Signed' : 'Pending',
        }
      })
    )

    res.json({ templates: templatesWithStatus })
  } catch (error) {
    next(error)
  }
}
