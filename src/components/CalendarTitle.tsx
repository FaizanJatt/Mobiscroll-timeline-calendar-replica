import moment from "moment";
import { v4 as uuidv4 } from "uuid";

interface DayData {
  date: Date;
  isWeekend: boolean;
}

interface CalendarTitleProps {
  daysArray: DayData[];
}

function CalendarTitle({ daysArray }: CalendarTitleProps) {
  const dateNow = moment().date();

  return (
    <div className="flex justify-start" id="calendarTitleComponent">
      <div className="h-8 bg-white sticky left-0 text-xs min-w-40 border-[#ccc] border"></div>
      <div className="flex">
        {daysArray.map((dayData) => {
          const date = dayData.date;
          return (
            <div
              key={uuidv4()}
              className="flex justify-center items-center w-20 pt-1 text-sm border-[#ccc] border"
            >
              <div
                className={`flex gap-2 ${
                  dateNow === moment(date).date() &&
                  "bg-blue-600 px-2 rounded-lg text-white"
                }`}
                id={`dateDay-${moment(date).date()}-${moment(date).format(
                  "ddd"
                )}`}
              >
                <div>{moment(date).date()}</div>
                <div>{moment(date).format("ddd")}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CalendarTitle;
