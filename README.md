# My Class Schedule

This is a web-based class schedule application with a workflow, courses, settings, and calendar for Macquarie University events.

## Project Structure

project-root/
│
├─ index.html # Main HTML file containing all sections
├─ style.css # Styles for the application
├─ script.js # JavaScript for app logic and calendar
└─ README.md # Project documentation (this file)


### File Details

#### `index.html`
- Contains the layout and sections:
  - **Workflow**: Add and view daily classes.
  - **Courses**: Add and view courses.
  - **Calendar**: Shows MQ University events.
  - **Settings**: Save student info and import/export data.
- Navigation bar switches between sections.
- Includes buttons for adding classes/courses and saving settings.

#### `style.css`
- Defines colors, fonts, and styles for all sections.
- Custom styles for cards, buttons, and calendar events.
- Responsive and visually consistent theme.

#### `script.js`
- Handles section switching and navigation.
- Stores and renders classes and courses in `scheduleData`.
- Implements settings save, import, export, and clear.
- Contains hardcoded **MQ University events** for the calendar.
- Renders calendar events dynamically.

#### `README.md`
- Describes project structure, usage, and purpose.

## How to Use

1. Open `index.html` in a browser.
2. Navigate between **Workflow**, **Courses**, **Calendar**, and **Settings** using the nav bar.
3. Add classes or courses in their respective sections.
4. Calendar tab automatically shows MQ University events.
5. Use settings to save student information and manage data.

## Notes
- Calendar events are preloaded and do not require user input.
- Data is stored in **localStorage**, so it persists across browser sessions.
- All styling and scripts are contained in separate files for maintainability.
