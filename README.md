# PIZZA MANAGER
Hello! Pizza Manager is a web application aimed to serve as a management software for Pizza restaurants. I developed this application as a coding challenge to apply the knowledge of the programming languages I am currently studying to become a junior software developer. In particular I wanted to create my first backend code with Node.js and integrate it with a MySQL database

# Programming Languages
The fronted of this application is developed using

- HTML
- CSS
- JavaScript

The backend logic is realized with
- Node.JS

The data is all stored in a relational database in

- MySQL

## Authentication

The first step to access the application is to sign up a new account.
To sign up you need to specify a valid email address, a unique Username, a password and the role of the account.
The roles you can choose from are:

- Waiter
- Cook
- Cashier

Every role has access to different features of the application relevant to their job.
There is also one admin account that can access all functions of the program but you can not create one from the UI of the application.
![enter image description here](https://i.postimg.cc/13z6sfRB/signup.png)

Once the account is registered, you can login and logout at anytime.
![enter image description here](https://i.postimg.cc/LXPLww4M/login.png)

![enter image description here](https://i.postimg.cc/VvBMLtbG/logout.png)
The account stays logged in until the session expires after a time you can set up in the environment variables.
## Make a new order

As a waiter, you have the possibility to register a new order right at the customers table.
For this reason the new order page is designed to work on the browser of a mobile device.
From this page you can add items to the order choosing from the drop down lists of each category. Once the item is added you can change its quantity or remove it completely with the quick buttons on the right.
![enter image description here](https://i.postimg.cc/Gt1GCK9T/neworder.png)

![enter image description here](https://i.postimg.cc/nLgqdpJk/neworder2.png)

## Orders summary

This screen is the core of the application as you can visualize and manage all the orders.
![enter image description here](https://i.postimg.cc/h49V0k3L/orders.png)

From this interface you can see the details of the orders, both active and closed ones.
You can then decide to close an order at checkout (cashier role) or modify an open one (i.e. an additional item is requested at a second time).
## Modify orders

You can modify an order by changing the quantities of existing items or adding new ones and then save it to the database.
![enter image description here](https://i.postimg.cc/zGPhB8Vr/updateorder.png)

![enter image description here](https://i.postimg.cc/QM9TKwTW/updateorder2.png)

## Pending Pizzas

Once the order of a pizza is placed, the cook needs to know it immediately in order to start cooking it.
For this reason the pizza-pending screen was created.
This is a list of all the pizza that are requested in this moment and it is automatically populated at each new order.
From this interface, the cook can check the pizzas that are ready and remove them from the list.
![enter image description here](https://i.postimg.cc/Xqwgr8Jd/pizzepending.png)


# Reservations

Another important feature of the app is to manage reservations of the table of the restaurant.
From a simple table, the user can see the status of each table during time slots of 15 minutes each.
For each slot is indicated also the number of seats requested for the reservation and the table capacity.
![enter image description here](https://i.postimg.cc/c4hYpQW6/reservations.png)

A new reservation can be placed simply clicking on the cell corresponding to the table and  the time slot required.
![enter image description here](https://i.postimg.cc/CLSkrcWW/newreservation.png)
