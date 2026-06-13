/* START: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */
export interface FieldSchemaType {
  fieldName?: string;
  type:
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array"
    | "color"
    | "url"
    | "enum"
    | "datetime"
    | "file"
    | "files";
  required?: boolean;
  label?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: string[];
  fields?: FieldSchemaType[];
  item?: FieldSchemaType;
}
/* END: THIS SECTION CODE IS CANNOT BE CHANGED, YOU ONLY READ IT */

export type ConfigurableSchemas = {
  formSchema: FieldSchemaType[];
};



export const configurableSchemas: ConfigurableSchemas = {
  formSchema: [
    {
      fieldName: "appName",
      type: "string",
      required: true,
      label: "App Name",
    },
    {
      fieldName: "logoUrl",
      type: "url",
      required: true,
      label: "Logo URL",
    },
    {
      fieldName: "brandColor",
      type: "object",
      required: true,
      label: "Brand Color",
      fields: [
        {
          fieldName: "primary",
          type: "color",
          required: true,
          label: "Primary",
        },
        {
          fieldName: "secondary",
          type: "color",
          required: true,
          label: "Secondary",
        },
        {
          fieldName: "accent",
          type: "color",
          required: true,
          label: "Accent",
        },
      ],
    },
    {
      fieldName: "cerebroAccentColor",
      type: "color",
      required: false,
      label: "Cerebro Accent Color",
    },
    {
      fieldName: "mastermindAccentColor",
      type: "color",
      required: false,
      label: "Mastermind Accent Color",
    },
    {
      fieldName: "leftAgentColor",
      type: "color",
      required: false,
      label: "Left Agent Color",
    },
    {
      fieldName: "rightAgentColor",
      type: "color",
      required: false,
      label: "Right Agent Color",
    },
    {
      fieldName: "dashboardTagline",
      type: "string",
      required: false,
      label: "Dashboard Tagline",
      maxLength: 120,
    },
    {
      fieldName: "mastermindWelcomeMessage",
      type: "string",
      required: false,
      label: "Mastermind Welcome Message",
      maxLength: 300,
    },
    {
      fieldName: "leftAgentName",
      type: "string",
      required: false,
      label: "Left Agent Name",
      maxLength: 30,
    },
    {
      fieldName: "rightAgentName",
      type: "string",
      required: false,
      label: "Right Agent Name",
      maxLength: 30,
    },
    {
      fieldName: "logTabLabels",
      type: "object",
      required: false,
      label: "Log Tab Labels",
      fields: [
        { fieldName: "preferences", type: "string", required: false, label: "Preferences Tab" },
        { fieldName: "wins", type: "string", required: false, label: "Wins Tab" },
        { fieldName: "failures", type: "string", required: false, label: "Failures Tab" },
        { fieldName: "decisions", type: "string", required: false, label: "Decisions Tab" },
        { fieldName: "general", type: "string", required: false, label: "General Tab" },
      ],
    },
  ],
};
