import React, { useEffect, useRef, useState } from "react";
import moment from "moment";
import Bin from "../assets/Bin";

interface EventData {
  title: string;
  startTime: Date;
  endTime: Date;
  originalColor: string;
  hoverColor: string;
  darkestColor: string;
  id: string;
}

interface EventProps {
  eventData: EventData;
  dayIndex: number;
  totalContainerWidth: number;
  onUpdateEvent: (updatedEvent: EventData) => void;
  onDeleteEvent: (deleteEvent: EventData) => void;
}

const formatTime = (date: Date) => {
  return moment(date).format("hh:mm A");
};

function Event({
  eventData,
  onUpdateEvent,
  dayIndex,
  totalContainerWidth,
  onDeleteEvent,
}: EventProps) {
  const [eventWidth, setEventWidth] = useState(0);
  const isResizing = useRef<Boolean>(false);
  const startTime = useRef<Date>();
  const endTime = useRef<Date>();
  const [hoverState, setHoverState] = useState<Boolean>(false);
  const [eventTimeState, setEventTimeState] = useState(
    `${formatTime(eventData.startTime)} - ${formatTime(eventData.endTime)}`
  );
  const [selected, setSelected] = useState(false);
  const eventRef = useRef<HTMLDivElement | null>(null);
  const isResizingLeft = useRef<boolean>(false); // Change isResizingLeft to a ref

  const [leftOffset, setLeftOffset] = useState(0); // New state to track left offset

  useEffect(() => {
    calculateInitialEventWidth();
  }, []);

  const calculateInitialEventWidth = () => {
    const totalMinutesInDay = 24 * 60;
    const startDate = moment(eventData.startTime).startOf("day");
    const endDate = moment(eventData.endTime).startOf("day");
    const numDays = endDate.diff(startDate, "days") + 1;
    let startMinutes =
      eventData.startTime.getHours() * 60 + eventData.startTime.getMinutes();
    let endMinutes =
      eventData.endTime.getHours() * 60 + eventData.endTime.getMinutes();
    const eventDurationMinutes =
      (numDays - 1) * totalMinutesInDay + (endMinutes - startMinutes);
    const widthPixels =
      (eventDurationMinutes / totalMinutesInDay) * totalContainerWidth +
      (numDays - 1);

    // Calculate left offset based on start time
    const offsetMinutes = startMinutes; // Minutes elapsed since start of day
    const offsetPixels = Math.round(
      (offsetMinutes / totalMinutesInDay) * totalContainerWidth
    );

    // Center events less than 1 day long (adjust the divisor if needed)
    if (numDays === 1 && offsetPixels > 0 && offsetPixels < 80 / 2) {
      // Assuming 80px per cell
      const centerOffset = (80 - widthPixels) / 2;
      console.log(centerOffset);
      setLeftOffset(Math.round(centerOffset));
    } else {
      setLeftOffset(offsetPixels);
    }
    console.log(widthPixels);

    setEventWidth(Math.max(widthPixels, 20));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    const threshold = 10;
    const rect = eventRef.current!.getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x < threshold) {
      isResizingLeft.current = true;
    } else if (x > rect.width - threshold) {
      isResizingLeft.current = false;
    } else {
      return;
    }

    isResizing.current = true;
    setSelected(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current || !eventRef.current) return;

    const rect = eventRef.current.getBoundingClientRect();
    const containerRect =
      eventRef.current.parentElement!.getBoundingClientRect();
    const totalMinutesInDay = 24 * 60;
    const minutesPerPixel = totalMinutesInDay / totalContainerWidth;

    const maxLeft = rect.left; // Maximum allowed left position (original left edge)

    if (isResizingLeft.current) {
      const newLeft = Math.min(maxLeft, e.clientX - containerRect.left); // Allow moving left up to original position
      let newWidth;
      if (newLeft > 0) {
        // let offsetChange = Math.abs(leftOffset) - Math.abs(newLeft);
        newWidth = eventWidth - Math.abs(newLeft);
        console.log(newWidth);
        // console.log(Math.abs(newLeft));
        setLeftOffset(Math.abs(newLeft));
      } else {
        let offsetChange = Math.abs(leftOffset) - Math.abs(newLeft);

        newWidth = eventWidth + Math.abs(offsetChange);
      }

      // Ensure the event doesn't become too small
      if (newWidth < 20) return;

      const newDayIndex = Math.floor(newLeft / totalContainerWidth);

      const newStartMinutes =
        eventData.startTime.getHours() * 60 +
        eventData.startTime.getMinutes() +
        Math.round(
          (dayIndex - newDayIndex) * totalMinutesInDay -
            newWidth * minutesPerPixel
        );

      const newStartTime = new Date(eventData.startTime);
      newStartTime.setDate(
        newStartTime.getDate() - (dayIndex - newDayIndex - 1)
      );
      newStartTime.setHours(Math.floor(newStartMinutes / 60));
      newStartTime.setMinutes(newStartMinutes % 60);

      startTime.current = newStartTime;
      endTime.current = eventData.endTime;
      setEventTimeState(
        `${formatTime(newStartTime)} - ${formatTime(eventData.endTime)}`
      );

      setEventWidth(newWidth);
      setLeftOffset(newLeft);
    } else {
      const newWidth = Math.max(e.clientX - rect.left, 20);
      setEventWidth(newWidth);

      const newEventDurationMinutes = Math.round(newWidth * minutesPerPixel);
      const newStartMinutes =
        eventData.startTime.getHours() * 60 + eventData.startTime.getMinutes();
      const newEndMinutes = newStartMinutes + newEventDurationMinutes;

      const newStartTime = new Date(eventData.startTime); // Keep the original start time
      const newEndTime = new Date(eventData.startTime);
      newEndTime.setHours(Math.floor(newEndMinutes / 60));
      newEndTime.setMinutes(newEndMinutes % 60);
      startTime.current = newStartTime;
      endTime.current = newEndTime;
      setEventTimeState(
        `${formatTime(newStartTime)} - ${formatTime(newEndTime)}`
      );
    }
  };

  const handleMouseUp = () => {
    if (startTime.current && endTime.current) {
      onUpdateEvent({
        ...eventData,
        startTime: startTime.current,
        endTime: endTime.current,
      });
    }
    startTime.current = undefined;
    endTime.current = undefined;
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const mouseMoveHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const threshold = 10;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isNearLeftEdge = x < threshold;
    const isNearRightEdge = x > rect.width - threshold;
    e.currentTarget.style.cursor =
      isNearLeftEdge || isNearRightEdge ? "ew-resize" : "pointer";
  };

  const innerHoverHandler = (e: React.MouseEvent<HTMLDivElement>) => {
    const threshold = 10;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isNearLeftEdge = x < threshold;
    const isNearRightEdge = x > rect.width - threshold;
    e.currentTarget.style.cursor =
      isNearLeftEdge || isNearRightEdge ? "pointer" : "default";
  };

  return (
    <div
      className={`flex 
      ${eventData.title === "" && "opacity-0 pointer-events-none"}
      `}
    >
      <div
        ref={eventRef}
        style={{
          width: `${eventWidth}px`,
          backgroundColor: selected
            ? eventData.darkestColor
            : hoverState
            ? eventData.hoverColor
            : eventData.originalColor,
          left: leftOffset,
        }}
        onMouseEnter={() => setHoverState(true)}
        onMouseMove={mouseMoveHandler}
        onMouseLeave={() => setHoverState(false)}
        onClick={() => setSelected(true)}
        className={`h-10  relative flex-shrink-0 flex justify-start items-start   rounded-md hover:opacity-100 `}
        onMouseDown={handleMouseDown}
      >
        {hoverState || isResizing.current ? (
          <div className="  z-50 absolute  w-min flex  justify-center h-10 items-center pointer-events-none">
            <div
              className={`p-[.2rem]  -left-1 border border-solid rounded-full bg-emerald-50 `}
              style={{
                borderColor: eventData.darkestColor || "black",
              }}
            ></div>
          </div>
        ) : null}
        {selected && !isResizing.current ? (
          <div className="  z-50 absolute  w-min flex overf justify-center h-10  items-center pointer-events-none">
            <div
              className={`p-[.2rem] relative  w-min  flex justify-center items-center -bottom-6 rounded-full  `}
            >
              <div
                onClick={() => {
                  onDeleteEvent(eventData);
                }}
                className="cursor-pointer pointer-events-auto"
              >
                {selected && (
                  <Bin height="12" color={eventData.originalColor} />
                )}
              </div>
            </div>
          </div>
        ) : null}
        <div
          onMouseEnter={innerHoverHandler}
          className={`p-1 overflow-hidden  text-xs text-nowrap pointer-events-none  ${
            selected ? "text-white" : "text-black"
          }`}
        >
          <p className="font-bold">{eventData.title}</p>
          <p className="text-[0.625rem]">{eventTimeState}</p>
        </div>
        {hoverState || isResizing.current ? (
          <div className="  z-50  absolute  w-full h-full flex justify-end items-center pointer-events-none ">
            <div
              className={`p-[.2rem]  border border-solid rounded-full bg-emerald-50 `}
              style={{
                borderColor: eventData.darkestColor,
              }}
            ></div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Event;
