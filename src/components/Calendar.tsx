import { useEffect, useState, useMemo } from "react";
import moment from "moment";
import CalendarTitle from "./CalendarTitle";
import CalendarBody from "./CalendarBody";
import { MouseEvent } from "react";
import Header from "./Header";
import { v4 as uuidv4 } from "uuid";

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
  id: string;
}

function Calendar() {
  const currentYear = moment().year();
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(currentYear);
  const [daysArray, setDaysArray] = useState<DayData[]>([]);
  const [resourceListWithEvents, setResourceListWithEvents] = useState<{
    [resource: string]: { date: Date; events: EventData[] }[];
  }>(() => {
    // Load from localStorage on initial render
    const storedDataString = localStorage.getItem("resourceListWithEvents");
    // localStorage.removeItem("resourceListWithEvents");
    if (storedDataString) {
      const parsedData = JSON.parse(storedDataString);

      // Convert date strings back to Date objects
      for (const resource in parsedData) {
        parsedData[resource] = parsedData[resource].map(
          (item: { date: string; events: EventData[] }) => ({
            date: new Date(item.date),
            events: item.events.map((event: EventData) => ({
              ...event,
              startTime: new Date(event.startTime),
              endTime: new Date(event.endTime),
            })),
          })
        );
      }
      return parsedData;
    }
    return {};
  });

  const filteredResourceList = useMemo(() => {
    const filteredData: {
      [resource: string]: { date: Date; events: EventData[] }[];
    } = {};

    for (const resource in resourceListWithEvents) {
      filteredData[resource] = resourceListWithEvents[resource].filter(
        (item) => {
          const itemDate = moment(item.date);
          return itemDate.month() === month && itemDate.year() === year; // Filter by month and year
        }
      );
    }

    return filteredData;
  }, [resourceListWithEvents, month, year]);

  useEffect(() => {
    localStorage.setItem(
      "resourceListWithEvents",
      JSON.stringify(resourceListWithEvents)
    );
  }, [resourceListWithEvents]);

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

    setResourceListWithEvents((prevResourceData) => {
      const newResourceData = { ...prevResourceData }; // Create a new object to trigger a re-render
      resourceList.forEach((resource) => {
        // Check if resource already has events for the month
        if (!newResourceData[resource]) {
          newResourceData[resource] = []; // Initialize if not present
        }

        daysArray.forEach((dayData) => {
          // Find existing item for this date or create a new one
          const existingItem = newResourceData[resource].find(
            (item) => item.date.getTime() === dayData.date.getTime()
          );

          if (!existingItem) {
            newResourceData[resource].push({
              date: dayData.date,
              events: [],
            });
          }
        });

        // Sort the resource items by date (if needed)
        newResourceData[resource].sort(
          (a, b) => a.date.getTime() - b.date.getTime()
        );
      });
      return newResourceData;
    });

    setDaysArray(daysArray); // Update daysArray
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
  const createEvent = (_: MouseEvent, resource: string, date: Date) => {
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
            id: uuidv4(),
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

  const onUpdateEvent = (resource: string, updatedEvent: EventData) => {
    console.log(updatedEvent);
    setResourceListWithEvents((prevResourceData) => {
      const newResourceData = { ...prevResourceData };
      const resourceItems = newResourceData[resource];

      if (resourceItems) {
        const updatedStartDate = moment(updatedEvent.startTime).startOf("day");
        const updatedEndDate = moment(updatedEvent.endTime).startOf("day");

        // Find the original position of the event to update
        const oldEventIndex = resourceItems.findIndex((item) =>
          item.events.some(
            (event) =>
              event.originalColor === updatedEvent.originalColor &&
              event.hoverColor === updatedEvent.hoverColor &&
              event.darkestColor === updatedEvent.darkestColor &&
              event.title === updatedEvent.title
          )
        );

        if (oldEventIndex === -1) return newResourceData; // Event not found

        // Remove the old event from its original position
        const oldEventItem = resourceItems.splice(oldEventIndex, 1)[0];
        const updatedEventsWithoutOldEvent = oldEventItem.events.filter(
          (event) =>
            !(
              event.originalColor === updatedEvent.originalColor &&
              event.hoverColor === updatedEvent.hoverColor &&
              event.darkestColor === updatedEvent.darkestColor &&
              event.title === updatedEvent.title
            )
        );

        resourceItems.splice(oldEventIndex, 0, {
          ...oldEventItem,
          events: updatedEventsWithoutOldEvent,
        }); // Put the item back without the old event

        // const numDays = updatedEndDate.diff(updatedStartDate, "days") + 1; // Number of days the updated event spans

        newResourceData[resource] = resourceItems.map((item, index) => {
          const itemDate = moment(item.date).startOf("day");
          const itemEnd = moment(item.date).endOf("day");

          if (
            index === oldEventIndex &&
            itemDate.isSame(updatedStartDate) &&
            itemEnd.isSame(updatedEndDate)
          ) {
            // Insert the updated event at the correct position
            return { ...item, events: [updatedEvent] };
          } else if (
            itemDate.isAfter(updatedStartDate) &&
            itemDate.isSameOrBefore(updatedEndDate)
          ) {
            const transparentEvent: EventData = {
              title: "",
              originalColor: "transparent",
              hoverColor: "transparent",
              darkestColor: "transparent",
              startTime: itemDate.toDate(),
              endTime: itemDate.isSame(updatedEndDate)
                ? updatedEvent.endTime
                : itemDate.endOf("day").toDate(),
              id: updatedEvent.id,
            };
            // if(item.events.includes())
            let exists = item.events.findIndex((e) => e.id === updatedEvent.id);
            console.log(exists);
            // console.log(item.events.includes);
            // let doesTransparentItemAlreadyExist =
            let updatedEvents: EventData[] = [];
            if (exists === -1) {
              console.log("DOESNT EXIST");
              updatedEvents = [...item.events, transparentEvent];
            }
            return { ...item, events: updatedEvents };
          } else {
            // If the item date is outside the updated event's range, return it unchanged
            return item;
          }
        });

        // Add updatedEvent to the new index
        const newEventIndex = resourceItems.findIndex((item) =>
          moment(item.date).startOf("day").isSame(updatedStartDate)
        );
        if (newEventIndex > -1)
          newResourceData[resource][newEventIndex].events.push(updatedEvent);
      }

      return newResourceData;
    });
  };

  // const deleteEvent = (
  //   resource: string,
  //   eventToDelete: EventData,
  //   eventIndex: number
  // ) => {
  //   setResourceListWithEvents((prevResourceData) => {
  //     const newResourceData = { ...prevResourceData };
  //     const resourceItems = newResourceData[resource];

  //     if (!resourceItems) return prevResourceData;

  //     const startDate = moment(eventToDelete.startTime).startOf("day");
  //     const endDate = moment(eventToDelete.endTime).startOf("day");

  //     newResourceData[resource] = resourceItems.map((item) => {
  //       const itemDate = moment(item.date).startOf("day");
  //       let updatedEvents = [...item.events];

  //       // 1. Check if the event to delete exists in this day's events
  //       if (
  //         itemDate.isSame(startDate) &&
  //         updatedEvents[eventIndex] === eventToDelete
  //       ) {
  //         updatedEvents.splice(eventIndex, 1); // Remove the original event

  //         // 2. Also remove any transparent events on the same day (startDate)
  //         updatedEvents = updatedEvents.filter(
  //           (event) =>
  //             !(
  //               event.originalColor === "transparent" &&
  //               event.hoverColor === "transparent" &&
  //               event.darkestColor === "transparent"
  //             )
  //         );
  //       } else if (
  //         // 3. If it's not the first day, remove transparent events
  //         itemDate.isAfter(startDate) &&
  //         itemDate.isSameOrBefore(endDate)
  //       ) {
  //         updatedEvents = updatedEvents.filter(
  //           (event) =>
  //             !(
  //               event.originalColor === "transparent" &&
  //               event.hoverColor === "transparent" &&
  //               event.darkestColor === "transparent"
  //             )
  //         );
  //       }

  //       return { ...item, events: updatedEvents };
  //     });

  //     return newResourceData;
  //   });
  // };
  const deleteEvent = (
    resource: string,
    eventToDelete: EventData
    // eventIndex: number
  ) => {
    setResourceListWithEvents((prevResourceData) => {
      const newResourceData = { ...prevResourceData };
      const resourceItems = newResourceData[resource];

      if (!resourceItems) return prevResourceData; // Resource not found, return unchanged data

      // Assuming EventData now has an id field
      const eventIdToDelete = eventToDelete.id;

      newResourceData[resource] = resourceItems.map((item) => ({
        ...item,
        events: item.events.filter((event) => event.id !== eventIdToDelete),
      }));

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
        resourceList={filteredResourceList}
        deleteEvent={deleteEvent}
        onUpdateEvent={onUpdateEvent}
      />
    </div>
  );
}
export default Calendar;
