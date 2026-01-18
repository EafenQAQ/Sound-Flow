# Spec: Login UI Redesign

## ADDED Requirements

### Requirement: Login page displays split-screen layout with blurred logo on left and form on right

The login page SHALL display a split-screen layout on desktop devices with a blurred logo image on the left side and the login form on the right side. On mobile devices, the layout SHALL stack vertically with the logo at the top and the form below it. The container SHALL have a floating appearance with shadow and rounded corners.

#### Scenario: User views login page on desktop

- Given the user navigates to the login page
- And the viewport width is greater than 768px
- Then the page displays a split-screen layout
- And the left side shows a blurred version of the logo
- And the right side shows the login form
- And the container has a floating appearance with shadow and rounded corners

#### Scenario: User views login page on mobile

- Given the user navigates to the login page
- And the viewport width is 768px or less
- Then the page displays a vertical stacked layout
- And the blurred logo appears at the top
- And the login form appears below the logo
- And the container maintains floating appearance

#### Scenario: User interacts with login form

- Given the user is on the login page
- When the user enters email and password
- And clicks the login button
- Then the form submission works as before
- And error messages display correctly
- And loading state shows correctly

### Requirement: Login page maintains existing functionality

The login page SHALL maintain all existing form functionality including email and password input, form submission, error message display, success message display, and loading state indication. All user interactions and behaviors SHALL remain unchanged.

#### Scenario: User submits invalid credentials

- Given the user is on the login page
- When the user enters invalid credentials
- And submits the form
- Then an error message is displayed
- And the error message is styled consistently with the new design

#### Scenario: User submits valid credentials

- Given the user is on the login page
- When the user enters valid credentials
- And submits the form
- Then a success message is displayed
- And the user is redirected to the home page

#### Scenario: User sees loading state

- Given the user is on the login page
- When the user submits the form
- And the request is in progress
- Then the button shows a loading spinner
- And the button is disabled
- And the button displays "登录中..."

## MODIFIED Requirements

### Requirement: Login page visual design

The login page SHALL display a modern, professional design using the project's color scheme (var(--primary), var(--secondary)). The layout SHALL be responsive across all device sizes. The logo SHALL be displayed clearly without blur effect. The welcome text SHALL use a font size matching the logo size and have an entrance animation.

#### Scenario: User views login page

- Given the user navigates to the login page
- Then the page displays a modern, professional design
- And the design uses the project's color scheme (var(--primary), var(--secondary))
- And the layout is responsive across all device sizes
- And the blurred logo effect is applied using CSS filter
