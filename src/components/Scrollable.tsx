import {FC} from "react";
import {HorizontalScroll, Tabs, TabsItem} from "@vkontakte/vkui";
import {format} from "@vkontakte/vkui/dist/lib/date";

const Scrollable: FC<{
  selectedDate: Date,
  setSelectedDate: (selectedDate: Date) => void,
  disabled?: boolean
}> = ({selectedDate, setSelectedDate, disabled}) => {
  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  return (
    <div>
      <Tabs mode='accent' style={{display: 'flex', justifyContent: 'center'}}>
        <HorizontalScroll arrowSize="m">
          {[-7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(i => {
            let dayNum = selectedDate.getDay() - 1
            if (dayNum === -1) {
              dayNum = 6
            }

            const d = addDays(selectedDate, -dayNum + i)
            return <TabsItem
              disabled={disabled || d.getTime() > (new Date).setMonth((new Date).getMonth() + 1)
                || addDays(d, 1).getTime() <= (new Date).setFullYear((new Date).getFullYear() - 10)}
              id={`tabsItem-${i.toString()}`}
              aria-controls={`tabsItem-${i.toString()}`}
              key={`${i.toString()}`}
              selected={dayNum == i}
              onClick={() => {
                setSelectedDate(addDays(selectedDate, -dayNum + i))
              }}
              style={{
                textAlign: "center",
                minWidth: '2.5em',
                marginLeft: '1px',
                marginRight: '1px'
              }}
            >
              <div style={format(d, 'dd.MM.yyyy') === format(new Date(), 'dd.MM.yyyy')
                ? {color: 'var(--vkui--color_accent_green)', display: 'flex', flexDirection: 'column'}
                : i < 0 || i > 6
                  ? {display: 'flex', flexDirection: 'column', fontWeight: '200'}
                  : {color: 'var(--vkui--color_text_primary)', display: 'flex', flexDirection: 'column'}}>
                <div>{d.toLocaleDateString("ru", {weekday: "short"}).toUpperCase()}</div>
                {dayNum == i
                  ? <div style={{borderTop: "solid 1px var(--vkui--color_accent_gray)"}}>{d.getDate()}</div>
                  : <div style={{borderTop: "solid 1px #00000000"}}>{d.getDate()}</div>}
              </div>
            </TabsItem>
          })}
        </HorizontalScroll>
      </Tabs>
    </div>
  );
};

export default Scrollable;