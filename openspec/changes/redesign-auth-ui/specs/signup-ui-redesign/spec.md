# Spec: Signup UI Redesign

## ADDED Requirements

### Requirement: Signup page displays split-screen layout with form on left and logo and welcome text on right

The signup page SHALL display a split-screen layout on desktop devices with signup form on the left side and a clear logo image and "欢迎！" welcome text on the right side. On mobile devices, the layout SHALL stack vertically with the logo and welcome text at the top and the form below it. The container SHALL have a floating appearance with shadow and rounded corners. The welcome text SHALL use a font size matching to logo size and have an entrance animation.

#### Scenario: User views signup page on desktop

- Given user navigates to signup page
- And viewport width is greater than 768px
- Then page displays a split-screen layout
- And left side shows the signup form
- And right side shows a blurred version of the logo
- And container has a floating appearance with shadow and rounded corners

#### Scenario: User views signup page on mobile

- Given user navigates to signup page
- And viewport width is 768px or less
- Then page displays a vertical stacked layout
- And blurred logo appears at the top
- And signup form appears below the logo
- And container maintains floating appearance

#### Scenario: User interacts with signup form

- Given user is on the signup page
- When user enters username, email, password, and confirm password
- And clicks the signup button
- Then form submission works as before
- And error messages display correctly
- And loading state shows correctly

### Requirement: Signup page maintains existing functionality

The signup page SHALL maintain all existing form functionality including username, email, password, and confirm password input, form submission, error message display, success message display, and loading state indication. All user interactions and behaviors SHALL remain unchanged.

#### Scenario: User submits mismatched passwords

- Given user is on the signup page
- When user enters different passwords in password and confirm password fields
- And submits the form
- Then an error message is displayed
- And error message states "两次输入的密码不一致"
- And form does not submit

#### Scenario: User submits valid registration

- Given user is on the signup page
- When user enters valid username, email, and matching passwords
- And submits the form
- Then a success message is displayed
- And success message states "注册成功 ✔"
- And user is redirected to login page after 2 seconds

#### Scenario: User sees loading state

- Given user is on the signup page
- When user submits the form
- And request is in progress
- Then button shows "Loading..."
- And button is disabled

## MODIFIED Requirements

### Requirement: Signup page visual design

The signup page SHALL display a modern, professional design using the project's color scheme (var(--primary), var(--secondary)). The layout SHALL be responsive across all device sizes. The blurred logo effect SHALL be applied using CSS filter.

#### Scenario: User views signup page

- Given user navigates to signup page
- Then the page displays a modern, professional design
- And the design uses the project's color scheme (var(--primary), var(--secondary))
- And the layout is responsive across all device sizes
- And the blurred logo effect is applied using CSS filter
