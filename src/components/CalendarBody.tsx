import moment from "moment";
import { MouseEvent } from "react";
interface CalendarBodyProps {
  daysArray: Date[];
  resourceList: string[];
  createEvent: (e: MouseEvent) => void;
}

function CalendarBody({
  daysArray,
  resourceList,
  createEvent,
}: CalendarBodyProps) {
  return (
    <div className="flex flex-col " id="calendarBody">
      {resourceList.map((eachResource, i) => {
        return (
          <div
            key={`${i * Math.ceil(Math.random() * 999)} Res`}
            className="flex w-max justify-start h-max "
          >
            <div className="sticky bg-white left-0 h-14 font-bold min-w-40  text-sm border-[#ccc] border">
              {eachResource}
            </div>

            {daysArray.map((date, index) => {
              return (
                <div
                  id="cell"
                  key={`${date.getTime()}-${index}-Month`}
                  className="flex w-20 gap-2 pt-1 text-sm border-[#ccc] border "
                  onDoubleClick={(e) => createEvent(e)}
                  // onDoubleClick={}
                >
                  {/* <div>{moment(date).day()}</div>
                  <div>{moment(date).format("ddd")}</div> */}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export default CalendarBody;
