## Harbor Scheduler
Harbor Scheduler is a dock reservation management system I built for the Columbia Software Solutions take-home project. The application is designed around the scheduling workflow of a marine research facility where vessels and waterfront events need to reserve berths for specific ranges of days.

Here is the link to the website! https://css-dock-scheduling-system.vercel.app

## Original Problem
The existing system stores more than 20 years of scheduling information in a spreadsheet. While the spreadsheet contains a lot of useful information, two important checks still have to be done manually: determining whether a berth has already been reserved during a requested period and determining whether a vessel is actually short enough to fit at the berth it has been assigned.
I wanted to preserve the useful part of the existing system—a calendar where staff can quickly understand what is happening at each berth—while moving these manual checks into the application itself.

## Solution
I built Harbor Scheduler as an interactive scheduling application where a user can view berth availability and create, edit, or delete reservations.
My main goal was not to add as many features as possible, but to address the two sources of manual work identified in the prompt. When someone creates a reservation, the application checks the vessel's length against the selected berth and checks the requested dates against existing reservations.
I also treated non-vessel events as reservations because, from the scheduler's perspective, an event and a vessel have the same important effect: they occupy a berth for a period of time.

## Features Implemented
The main schedule provides a visual overview of which berths are occupied and when. Users can navigate between months and inspect individual reservations without having to search through spreadsheet cells.
The application supports creating, editing, and deleting both vessel reservations and events. Vessel reservations include vessel length so the application can determine whether a berth is physically suitable. Date conflicts are detected before a reservation can be saved.
I also included search/filtering, persistent browser storage, reservation details, and the ability to reset the application to its original demo data.
One feature I thought was particularly important was making errors preventative rather than informational. Instead of allowing someone to make an invalid reservation and warning them afterward, the system tries to stop invalid berth assignments and scheduling conflicts while the reservation is being created.

## Architecture
I built the project using React and TypeScript with Vite.
I separated the application into UI components, data/models, and scheduling logic rather than putting everything into one large component. I wanted calculations such as date overlap and berth compatibility to exist independently from how those results are displayed.
At a high level, I thought about the application as three layers:
Data represents berths and reservations.
Scheduling logic determines whether a reservation is valid.
UI components allow users to view and modify that information.
This separation was intentional because the storage method or interface could change later without requiring the fundamental scheduling rules to be rewritten.
For the scope of this prototype, everything runs client-side. There is no authentication or backend server.

## Data Model
I simplified the spreadsheet into two main concepts: berths and reservations.
A berth contains information such as its name and maximum vessel length. A reservation contains a name, berth, start date, end date, type, and optional notes. Vessel reservations additionally contain a vessel length.
I chose to represent both vessels and events with the same underlying reservation structure. Initially, it would be natural to think of them as separate objects. However, both block the use of a berth over a date range, which means they need to participate in exactly the same conflict-detection process.
The major distinction is that a vessel has a length that needs to be validated, while an event does not.
This also made the scheduling logic simpler because the system only needs to ask:
"Is this berth already occupied during these dates?"
rather than maintaining separate scheduling systems for events and vessels.

## Assumptions
Because the original prompt was deliberately open-ended, I made several assumptions to keep the prototype focused.
I assumed that a reservation occupies one berth for its entire date range and that the dates are inclusive. Therefore, if one reservation ends on June 10 and another begins on June 10 at the same berth, I treat that as a conflict.
I assumed that only one reservation can occupy a berth at a time. I did not attempt to model partial berth usage.
I also assumed that vessel length is the primary physical compatibility constraint because berth length was the constraint specifically identified in the prompt and historical spreadsheet. A real marine scheduling system would likely need to consider additional characteristics such as draft, beam, tides, utilities, or operational requirements.
Events were assumed to occupy the entire berth they are assigned to, just as a vessel would.
Finally, I treated the supplied historical schedule primarily as reference data rather than trying to build a complete historical migration system within the scope of the take-home.
