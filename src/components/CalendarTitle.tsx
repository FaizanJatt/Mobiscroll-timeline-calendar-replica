import moment from "moment";
interface CalendarTitleProps {
  daysArray: Date[];
}

function CalendarTitle({ daysArray }: CalendarTitleProps) {
  const dateNow = moment().date();
  return (
    <div className="flex justify-start  ">
      <div className=" h-8  bg-white sticky left-0 text-xs  min-w-40  border-[#ccc] border" />
      <div className="flex">
        {daysArray.map((date, i) => {
          return (
            <div
              key={`${i * Math.random() * 999}`}
              className="flex justify-center items-center w-20 pt-1 text-sm border-[#ccc] border "
            >
              <div
                className={` flex gap-2 ${
                  dateNow === moment(date).date() &&
                  "bg-blue-600 px-2  rounded-lg text-white"
                }`}
                id={`dateDay-${moment(date).date()}-${moment(date).format(
                  "ddd"
                )}`}
              >
                <div> {moment(date).date()}</div>
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
