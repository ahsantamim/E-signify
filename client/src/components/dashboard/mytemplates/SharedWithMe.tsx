import React from "react";
import DocumentAlias from "../DocumentAlias";
import Link from "next/link";

const SharedWithMe = () => {
    return (
        <Link href="/dashboard/create-template">
            <DocumentAlias
                docu_title="Resending the same envelopes?"
                docu_text="Save documents, placeholder recipients and fields as a template so you can save time."
                docu_link=""
                docu_img="/template.png"
                btn_show="invisible"
                btn_text="Create a Template"
            />
        </Link>
    );
};

export default SharedWithMe;
