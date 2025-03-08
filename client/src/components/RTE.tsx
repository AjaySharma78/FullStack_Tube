import { Editor } from "@tinymce/tinymce-react";
import React from "react";
import { Controller } from "react-hook-form";
import { Control } from "react-hook-form";
import config from "../env/config";

interface RTEProps {
  name: string;
  control: Control<any>;
  label?: string;
  defaultValue?: string;
  mess?: string;
}

const RTE = React.forwardRef<HTMLInputElement, RTEProps>(
  ({ mess, name, control, label, defaultValue = "" }, ref) => {
    return (
      <div className="w-full h-1/2 flex flex-col">
        <div className="flex items-center">
          {label && (
            <label className="inline-block pl-1 dark:text-zinc-300">{label}</label>
          )}
          <p className="text-red-400 ml-1 text-xs">{mess}</p>
        </div>
        <Controller
          name={name || "Description:"}
          control={control}
          render={({ field: { onChange } }) => (
            <Editor
              
              onInit={(_evt, editor: any) => {
                if (typeof ref === "function") {
                  ref(editor);
                } else if (ref && "current" in ref) {
                  (ref as React.MutableRefObject<any>).current = editor;
                }
              }}
              apiKey={`${config.rteSecret}`}
              initialValue={defaultValue}
              init={{
                initialValue: defaultValue,
                height: 300,
                highlight_on_focus: false,
                branding: false,
                menubar: true,
                plugins: [
                  "nonbreaking",
                  "insertdatetime",
                  "importcss",
                  "emoticons",
                  "directionality",
                  "codesample",
                  "autosave",
                  "accordion",
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "wordcount",
                  "pagebreak",
                  "quickbars",
                  "save",
                  "searchreplace",
                  "table",
                ],
                toolbar:
                  "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | ltr | rtl| anchor | image | media | codesample | emoticons | pagebreak | preview | save | searchreplace | table | charmap | insertdatetime | nonbreaking | quickbars | wordcount | restoredraft ",
                content_style:
                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px; background-color: rgb(39 39 42 / 1 ); color: white }",
                skin: "oxide-dark",
              }}
              onEditorChange={onChange}
            />
          )}
        />
      </div>
    );
  }
);

export default RTE;
