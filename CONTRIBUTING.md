## How to contribute to OpenRecord

* Make changes in the `/lib` directory, add a test to the `/test` directory and run `npm test`.
* Before sending a pull request for a feature or bug fix, be sure to have created tests.
* Use the same coding style as the rest of the codebase (see `.eslintrc.js`)
* All pull requests should be made to the `master` branch.


## Get started locally

### MySQL
1. install the official mysql server for your system
2. create the `travis` user for our tests  
```bash
mysql -u root -p -e "CREATE USER 'travis'@'%' IDENTIFIED WITH 'mysql_native_password' BY '';";
mysql -u root -p -e "GRANT ALL PRIVILEGES ON *.* TO 'travis'@'%' WITH GRANT OPTION; FLUSH PRIVILEGES;"
```
3. alter the root user to allow the login without a password (for local development only!!!)
```bash
mysql -u root -p -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY '';
```