// src/components/DocumentSignSection.tsx
import React from "react";
import Image from "next/image";
import { IoMdArrowDropdown } from "react-icons/io";

interface DocumentAliasProps {
    docu_title: string;
    docu_text: string;
    docu_img: string;
    btn_show: string;
    docu_link: string;
    btn_text: string;
}

const DocumentAlias: React.FC<DocumentAliasProps> = ({
    docu_title,
    docu_text,
    docu_img,
    btn_show,
    docu_link,
    btn_text,
}) => {
    return (
        <div className="w-full h-full my-10 flex justify-center items-center">
            <div className="container w-3/4 flex flex-col gap-4 justify-center items-start lg:flex-row lg:items-center">
                <div className="paper">
                    <Image
                        src={docu_img}
                        width={350}
                        height={350}
                        alt="paper"
                    />
                </div>
                <div className="signed ml-5 lg:ml-0">
                    <div className="flex flex-col gap-6">
                        <div className="text-2xl">{docu_title}</div>
                        <div className="text-lg">
                            {docu_text}{" "}
                            <span className="underline text-blue-700 cursor-pointer hover:cursor-pointer">
                                {docu_link}
                            </span>
                        </div>
                        <div className="flex">
                            <button className="w-40 rounded-sm bg-[var(--button-color)] text-white py-2 px-4 hover:bg-[var(--button-hover-color)] mb-6">
                                {btn_text}
                            </button>
                            <button
                                className={`flex ${btn_show} justify-center items-center rounded-sm bg-[var(--button-color)] text-white py-2 px-4 hover:bg-[var(--button-hover-color)] mb-6`}
                            >
                                <IoMdArrowDropdown size={16} />
                            </button>
                            {/* <button className="flex `{btn_show}` justify-center items-center rounded-sm bg-[var(--button-color)] text-white py-2 px-4 hover:bg-[var(--button-hover-color)] mb-6}">
                                <IoMdArrowDropdown size={16} />
                            </button> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentAlias;
