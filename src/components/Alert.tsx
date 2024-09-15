import React, {FC} from "react";
import {Alert} from "@mui/material";

const NewAlert: FC<{
  children?: React.ReactNode
  severity?: "error" | "info" | "success" | "warning" | undefined
}> = ({children, severity}) => <Alert
  variant="outlined"
  severity={severity}
  style={{borderRadius: "var(--vkui--size_border_radius--regular)"}}
  children={children}
/>

export default NewAlert;