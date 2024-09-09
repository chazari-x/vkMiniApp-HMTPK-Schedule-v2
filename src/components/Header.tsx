import {FC} from "react";
import {IconButton, PanelHeader} from "@vkontakte/vkui";
import {Icon28Menu} from "@vkontakte/icons";

const Header: FC<{
  disabled?: boolean | undefined
  toggleContext: () => void
  header: string
}> = ({disabled, toggleContext, header}) => <PanelHeader
  before={<IconButton disabled={disabled} onClick={toggleContext}><Icon28Menu/></IconButton>}
  children={header}
/>


export default Header;