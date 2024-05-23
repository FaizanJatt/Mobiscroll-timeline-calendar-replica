import { useEffect, useState } from "react";
import moment from "moment";
import CalendarTitle from "./CalendarTitle";
import CalendarBody from "./CalendarBody";
import { MouseEvent } from "react";
import Header from "./Header";

function darkenColor(color: string, factor: number) {
  const hex = color.replace(/^#/, "");
  const rgb = parseInt(hex, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = rgb & 0xff;

  const newR = Math.round(r * (1 - factor));
  const newG = Math.round(g * (1 - factor));
  const newB = Math.round(b * (1 - factor));

  const newHex = ((newR << 16) | (newG << 8) | newB)
    .toString(16)
    .padStart(6, "0");

  return `#${newHex}`;
}

const resourceList = [
  "Resource A",
  "Resource B",
  "Resource C",
  "Resource D",
  "Resource F",
  "Resource G",
  "Resource H",
  "Resource I",
  "Resource J",
  "Resource K",
  "Resource L",
  "Resource M ",
  "Resource N",
  "Resource O",
  "Resource P",
  "Resource Q",
  "Resource R",
];

interface DayData {
  date: Date;
  isWeekend: boolean;
}

interface EventData {
  title: string;
  startTime: Date;
  endTime: Date;
  originalColor: string;
  hoverColor: string;
  darkestColor: string;
}

function Calendar() {
  const currentYear = moment().year();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(currentYear);
  const [daysArray, setDaysArray] = useState<DayData[]>([]);
  const [resourceListWithEvents, setResourceListWithEvents] = useState<{
    [resource: string]: { date: Date; events: EventData[] }[];
  }>({});

  useEffect(() => {
    calendarMonthLayoutHandler();
  }, [month, year]);

  const scrollToCurrentDay = () => {
    const dateNow = moment().date();
    const elements = document.querySelectorAll('[id*="dateDay"]');
    elements.forEach((element) => {
      const [_, currDate] = element.id.split("-");
      if (dateNow === parseInt(currDate)) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      }
    });
  };

  const calendarMonthLayoutHandler = () => {
    const firstDayOfMonth = moment([year, month]);
    const daysInMonth = firstDayOfMonth.daysInMonth();
    const daysArray: DayData[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = firstDayOfMonth.clone().date(day);
      daysArray.push({
        date: currentDate.toDate(),
        isWeekend: currentDate.day() === 0 || currentDate.day() === 6,
      });
    }
    const newResourceData: {
      [resource: string]: { date: Date; events: EventData[] }[];
    } = {};
    resourceList.forEach((resource) => {
      newResourceData[resource] = daysArray.map((dayData) => ({
        date: dayData.date,
        events: [],
      }));
    });

    setDaysArray(daysArray);
    setResourceListWithEvents(newResourceData);
  };

  const monthYearChangeHandler = (
    currMonth: number,
    currYear: number,
    action: "back" | "forward"
  ) => {
    if (action === "back") {
      const nextMonth = currMonth - 1 === -1 ? 11 : currMonth - 1;
      setMonth(nextMonth);
      currMonth - 1 === -1 && setYear(currYear - 1);
    } else {
      const nextMonth = currMonth + 1 === 12 ? 0 : currMonth + 1;
      currMonth + 1 === 12 && setYear(currYear + 1);
      setMonth(nextMonth);
    }
  };
  const generateLightColor = () => {
    let color;
    do {
      color = Math.floor(Math.random() * 16777215).toString(16);
    } while (parseInt(color, 16) < 0xcccccc); // Increased threshold to 0xCCCCCC
    return `#${color}`;
  };
  const createEvent = (e: MouseEvent, resource: string, date: Date) => {
    const originalColor = generateLightColor();

    const hoverColor = darkenColor(originalColor, 0.2);
    const darkestColor = darkenColor(originalColor, 0.25);
    setResourceListWithEvents((prevResourceData) => {
      const newResourceData = { ...prevResourceData };
      const resourceItems = newResourceData[resource];

      if (resourceItems) {
        const selectedResourceIndex = resourceItems.findIndex(
          (r) =>
            r.date.toISOString().slice(0, 10) ===
            date.toISOString().slice(0, 10)
        );

        if (selectedResourceIndex !== -1) {
          const startTime = new Date(date);
          startTime.setHours(0, 0, 0, 0);
          const endTime = new Date(date);
          endTime.setHours(23, 59, 59, 999);

          const newEvent: EventData = {
            title: "New event",
            startTime,
            endTime,
            originalColor,
            hoverColor,
            darkestColor,
          };

          // Update the event array immutably for this specific resource and date
          newResourceData[resource] = [
            ...resourceItems.slice(0, selectedResourceIndex),
            {
              ...resourceItems[selectedResourceIndex],
              events: [
                ...resourceItems[selectedResourceIndex].events,
                newEvent,
              ],
            },
            ...resourceItems.slice(selectedResourceIndex + 1),
          ];
        }
      }

      return newResourceData;
    });
  };

  const onUpdateEvent = (
    resource: string,
    date: Date,
    updatedEvent: EventData
  ) => {
    console.log("ON UPDATING");
    console.log(date, updatedEvent, resource);

    setResourceListWithEvents((prevResourceData) => {
      const newResourceData = { ...prevResourceData };
      const resourceItems = newResourceData[resource];

      if (resourceItems) {
        newResourceData[resource] = resourceItems.map((item) =>
          item.date.getTime() === date.getTime()
            ? { ...item, events: [updatedEvent] } // Replace the entire events array with the updated event
            : item
        );
      }
      return newResourceData;
    });
  };

  return (
    <div className="flex flex-col h-max min-h-full">
      <div className="h-12">
        <Header
          monthYearChangeHandler={monthYearChangeHandler}
          month={month}
          year={year}
          scrollToCurrentDay={scrollToCurrentDay}
        />
      </div>
      <CalendarTitle daysArray={daysArray} />
      <CalendarBody
        createEvent={createEvent}
        resourceList={resourceListWithEvents}
        daysArray={daysArray}
        onUpdateEvent={onUpdateEvent} // Pass onUpdateEvent to CalendarBody
      />
    </div>
  );
}
export default Calendar;
