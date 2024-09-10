import React, {FC} from "react";
import {Cell, Panel} from "@vkontakte/vkui";
import config from "../etc/config.json";

const Abitur: FC<{
  id: string,
  panelHeader: React.ReactNode
}> = ({id, panelHeader}) => {
  const elements = [
    {
      label: 'Приемная комиссия',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Правила и условия приёма',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Специальности и направления',
      value: 'abitur/directions/#textbody'
    },
    {
      label: 'Документы и справки',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Подать заявление (онлайн)',
      value: 'abitur/online-form/#textbody'
    },
    {
      label: 'Информация о количестве поданных заявлений',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Рейтинг-листы',
      value: 'applicants/rating/#textbody'
    },
    {
      label: 'Список лиц, рекомендованных к зачислению',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Платные образовательные услуги',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Информация об общежитии',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Часто задаваемые вопросы',
      value: 'abitur/faq-abitur/#textbody'
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

export default Abitur;