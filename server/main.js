import { Meteor } from 'meteor/meteor';
import mysql from 'promise-mysql';

import { Mongo } from 'meteor/mongo';
export const Hobbitses = new Mongo.Collection('Hobbitses');


const connectionParameters = {
    host: 'localhost',
    user: 'sauron',
    password: 'theonetruering',
    database: 'mordor'
};


Meteor.startup(() => {

    mysql.createConnection({
        host: 'localhost',
        user: 'sauron',
        password: 'theonetruering',
        database: 'mordor'
    }).then(conn => {
        connection = conn;
        //console.log(connection);
        return connection.query('select `name` from hobbits');
    }).then(result => {
        console.log(result);
    });
});

Meteor.methods({
    getHobbits1() {
        let connection;

        mysql.createConnection({
            host: 'localhost',
            user: 'sauron',
            password: 'theonetruering',
            database: 'mordor'
        }).then(conn => {
            connection = conn;
            return connection.query('select `name` from hobbits');
        }).then(result => {
            return result; // will NOT work!
        });
    },
    getHobbits2() {
        let connection;
        let rows;

        mysql.createConnection({
            host: 'localhost',
            user: 'sauron',
            password: 'theonetruering',
            database: 'mordor'
        }).then(conn => {
            connection = conn;
            return connection.query('select `name` from hobbits');
        }).then(result => {
            rows = result;
        });
        return rows; // will NOT work!
    },
    getHobbitsPromise() {
        const connection = Promise.await(mysql.createConnection({
            host: 'localhost',
            user: 'sauron',
            password: 'theonetruering',
            database: 'mordor'
        }));
        const rows = Promise.await(connection.query('select `name` from hobbits'));
        return rows;
    },
    async getHobbitsError() {
        let connection;
        try {
            connection = await mysql.createConnection({
                host: 'localhost',
                user: 'sauron',
                password: 'theonetruering',
                database: 'mordor'
            });
            const result = await connection.query('select `name` from hobbits');
            return result;
        } catch (error) {
            console.log(error);
            throw new Meteor.Error('oops', 'something bad happened');
        } finally {
            if (connection && connection.end) {
                await connection.end();
            } // Let's be nice and close the connection
        }
    },

    async getHobbitsAsync() {
        console.log('getHobbitsAsync called');
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'sauron',
            password: 'theonetruering',
            database: 'mordor'
        });
        const result = await connection.query(`
        select name from hobbits limit 100
        `);
        console.log('getHobbitsAsync executed&&&');
        return result;
    },
    getHobbitsWithFiber() {
        let connection;

        const promisedResult = mysql.createConnection({
            host: 'localhost',
            user: 'sauron',
            password: 'theonetruering',
            database: 'mordor'
        }).then(conn => {
            connection = conn;
            return connection.query('select `name` from hobbits');
        }).then(result => {
            result.forEach(row => {
                //OLD Code throwing exception:Meteor code must always run within a Fiber.
                // Try wrapping callbacks that you pass to non-Meteor libraries with Meteor.bindEnvironment.
                //Hobbitses.insert({ name: row.name });
                // New Code which is aware about Fiber
                //Below rawCollection API and minimongodb _id column have diffrent data type
                //Hobbitses.rawCollection().insert({ name: row.name });
                //Set your own random id
                Hobbitses.rawCollection().insert({ _id: Random.id(), name: row.name });

            });
            return result;
        });
        return promisedResult;
    },
    async getHobbitsFinal() {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'sauron',
            password: 'theonetruering',
            database: 'mordor'
        });
        const result = await connection.query('select `name` from hobbits');
        result.forEach(row => {
            Hobbitses.insert({ name: row.name });
        });
        await connection.end();
        return result;
    },
    async getHobbits() {
        let connection;
        try {
            connection = await mysql.createConnection(connectionParameters);
            const result = await connection.query(
                `select
          h.name,
          i.name as item
        from hobbits as h
        left outer join items as i on i.owner = h.id
        order by h.id`);
            return result;
        } catch (error) {
            throw new Meteor.Error('getHobbits', 'something bad happened');
        } finally {
            if (connection && connection.end) {
                await connection.end();
            } // Let's be nice and close the connection
        }
    },
    async assignRing(id) {
        let connection;
        try {
            connection = await mysql.createConnection(connectionParameters);
            const result = await connection.query(
                `update items
          set owner = ${id}
        where name = 'ring'`); // Really should have an index on items.name, but hey.
            return result;
        } catch (error) {
            throw new Meteor.Error('assignRing', 'something bad happened');
        } finally {
            if (connection && connection.end) {
                await connection.end();
            } // Let's be nice and close the connection
        }
    },

});