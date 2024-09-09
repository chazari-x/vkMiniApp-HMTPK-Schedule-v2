import {FC} from "react";
import {IconButton, PanelHeader} from "@vkontakte/vkui";
import {Icon28Menu} from "@vkontakte/icons";
import config from "../etc/config.json";

const Header: FC<{
  disabled?: boolean | undefined
  toggleContext: () => void
}> = ({disabled, toggleContext}) => <PanelHeader
  before={<IconButton disabled={disabled} onClick={toggleContext}><Icon28Menu/></IconButton>}
  children={config.texts.Schedule}
/>


export default Header;