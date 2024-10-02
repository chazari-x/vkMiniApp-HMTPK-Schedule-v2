import React, {FC, HtmlHTMLAttributes, useEffect} from "react";
import {Cell, Panel} from "@vkontakte/vkui";
import config from "../etc/config.json";
import {SetupResizeObserver} from "../utils/utils.tsx";

export interface Props {
  id: string;
  panelHeader: React.ReactNode;
}

const Abitur: FC<{ props: Props; } & HtmlHTMLAttributes<HTMLDivElement>> = ({props}) => {
  const {id, panelHeader} = props;

  useEffect(() => SetupResizeObserver(id + "_resize"), []);

  const elements = [
    {
      label: 'Приемная комиссия',
      value: 'abitur/admission/#step745'
    },
    {
      label: 'Правила и условия приёма',
      value: 'abitur/admission/#step745'
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
      value: 'abitur/admission/#step751'
    },
    {
      label: 'Рейтинг-листы',
      value: 'abitur/admission/#step751'
    },
    {
      label: 'Список лиц, рекомендованных к зачислению',
      value: 'abitur/admission/#step751'
    },
    {
      label: 'Платные образовательные услуги',
      value: 'abitur/admission/#textbody'
    },
    {
      label: 'Информация об общежитии',
      value: 'abitur/admission/#step750'
    },
    {
      label: 'Часто задаваемые вопросы',
      value: 'abitur/faq-abitur/#textbody'
    },
  ] as { label: string, value: string, disabled?: boolean; }[];

  return <Panel id={id}>
    {panelHeader}
    <div id={id + "_resize"}>
      {elements.map((element) => <Cell
        key={element.value}
        href={`${config.hrefs.college}/${element.value}`}
        target="_blank"
        multiline
        children={element.label}
        disabled={element.disabled}
      />)}
    </div>
  </Panel>;
};

export default Abitur;