# OPENRECORD

OPENRECORD is a powerfull but simple to use ORM for nodejs.  
The primary goal is to offer a clean and easy to use API to your datastore. No matter if you want to connect to Postgres, MySQL or an ActiveDirectory. The API should be simmilar, but support all the important features of your database!

As the name imply, OPENRECORD is open and very easy to extend. The whole package was build that way.

Currently it supports the following databases/datastores: SQLite3, MySQL, Postgres, Oracle, REST and LDAP (+ ActiveDirectory)  
If you want to build a GraphQL endpoint for any of these databases, OPENRECORD has some build in features to support you!

OPENRECORD has a lot of features, just take a look at the [docs](https://philwaldmann.github.io/openrecord)!

# Why?

There are a lot of different ORMs (or simmilar) in the nodejs ecosystem to choose from. So why OPENRECORD?  
This project started many years ago - when the current version of nodejs was < 1.0. At that time there were a hand full of ORMs available.
From my point of view, they all had a terrible API and were lacking some important features. Most of them tried to support many different databases and therefore important database specific features were missing.  
Supporting different databases if not a bad thing, but the ORM should embrace the differences, instead of unifying them all unter a common denominator.

OPENRECORD was inspired by [ActiveRecord](http://guides.rubyonrails.org/active_record_basics.html), but ultimately has some unique touches on certain areas.

It's used in production since 2014 for many projects and even powers an application which manages an ActiveDirectory with aproxmilately 10.000 computers and 30.000 - 40.000 users.
Although most of the work was invested into supporting relational databases like Postgres or MySQL.