import { MouseEvent, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

import Event from "./Event";

interface EventData {
  title: string;
  startTime: Date;
  endTime: Date;
  originalColor: string;
  hoverColor: string;
  darkestColor: string;
  id: string;
}

interface CalendarBodyProps {
  resourceList: { [resource: string]: { date: Date; events: EventData[] }[] };
  createEvent: (e: MouseEvent, resource: string, date: Date) => void;
  onUpdateEvent: (resource: string, updatedEvent: EventData) => void;
  deleteEvent: (resource: string, eventToDelete: EventData) => void;
}
function CalendarBody({
  resourceList,
  createEvent,
  onUpdateEvent,
  deleteEvent,
}: CalendarBodyProps) {
  const rowRefs = useRef<{ [resourceName: string]: HTMLDivElement | null }>({});

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const handleEventClick = (eventId: string) => {
    setSelectedEventId((prevId) => (prevId === eventId ? null : eventId)); // Toggle selection
  };
  console.log(selectedEventId);
  useEffect(() => {
    // Adjust row heights after render
    for (const resourceName in rowRefs.current) {
      const row = rowRefs.current[resourceName];
      if (row) {
        const cells = row.querySelectorAll("#cell"); // Get all cells in this row
        let maxHeight = 0;
        cells.forEach((cell) => {
          if (cell instanceof HTMLElement && cell.offsetHeight > maxHeight) {
            maxHeight = cell.offsetHeight; // Find the maximum cell height
          }
        });
        cells.forEach((cell) => {
          if (cell instanceof HTMLElement) {
            cell.style.minHeight = `${maxHeight}px`; // Set minHeight for all cells
          }
        });
      }
    }
  }, [resourceList]);

  return (
    <div className="flex flex-col h-max" id="calendarBody">
      {Object.entries(resourceList).map(([resourceName, resourceItems]) => (
        <div
          key={uuidv4()}
          className="flex w-full "
          ref={(el) => (rowRefs.current[resourceName] = el)}
        >
          <div className="sticky z-50  bg-white left-0 font-bold min-w-40 text-sm border-[#ccc] border">
            {resourceName}
          </div>

          <div className="flex flex-grow h-auto min-h-16 justify-start items-start ">
            {resourceItems.map((resourceItem, index) => (
              <div
                id="cell"
                key={uuidv4()}
                className=" text-xs pb-1 pt-1 w-20 flex flex-col gap-2  h-[100%] border-[#ccc] border"
                onDoubleClick={(e) =>
                  createEvent(e, resourceName, resourceItem.date)
                }
              >
                {resourceItem.events.map((event) => (
                  <Event
                    key={uuidv4()}
                    eventData={event}
                    dayIndex={index}
                    totalContainerWidth={80}
                    onUpdateEvent={(updatedEvent) => {
                      onUpdateEvent(resourceName, updatedEvent);
                    }}
                    onDeleteEvent={(eventToDelete) => {
                      deleteEvent(resourceName, eventToDelete);
                    }}
                    isSelected={event.id === selectedEventId}
                    onEventClick={(event) => handleEventClick(event.id)}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
export default CalendarBody;
