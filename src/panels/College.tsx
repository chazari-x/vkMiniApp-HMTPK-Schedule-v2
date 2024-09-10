import React, {FC} from "react";
import {Cell, Panel} from "@vkontakte/vkui";
import config from "../etc/config.json";

const College: FC<{
  id: string,
  panelHeader: React.ReactNode
}> = ({id, panelHeader}) => {
  const elements = [
    {
      label: 'Основные сведения',
      value: 'sveden/common/#textbody'
    },
    {
      label: 'Структура и органы управления образовательной организацией',
      value: 'sveden/struct/#textbody'
    },
    {
      label: 'Документы',
      value: 'sveden/document/#textbody'
    },
    {
      label: 'Образование',
      value: 'sveden/education/#textbody'
    },
    {
      label: 'Образовательные стандарты РФ',
      value: 'sveden/eduStandarts/#textbody'
    },
    {
      label: 'Руководство. Педагогический (научно-педагогический) состав',
      value: 'sveden/employees/#textbody'
    },
    {
      label: 'Материально-техническое обеспечение и оснащённость образовательного процесса',
      value: 'sveden/objects/#textbody'
    },
    {
      label: 'Стипендия и иные виды материальной поддержки',
      value: 'sveden/grants/#textbody'
    },
    {
      label: 'Платные образовательные услуги',
      value: 'sveden/paid_edu/#textbody'
    },
    {
      label: 'Финансово-хозяйственная деятельность',
      value: 'sveden/budget/#textbody'
    },
    {
      label: 'Вакантные места для приёма (перевода)',
      value: 'sveden/vacant/#textbody'
    },
  ] as { label: string, value: string, disabled?: boolean }[]

  return <Panel id={id}>
    {panelHeader}
    {elements.map((element) => <Cell
      key={element.value}
      href={`${config.hrefs.college}/${element.value}`}
      target="_blank"
      children={<div style={{
        textWrap: 'wrap',
        width: '100%',
      }}>{element.label}</div>}
      disabled={element.disabled}
    />)}
  </Panel>
}

export default College;