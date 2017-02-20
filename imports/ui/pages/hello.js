import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Promise } from 'meteor/promise';

import './hello.html';

/**
 * Created method to understand how to wrap meteor call in Promise syntax
 * You can use 'https://atmospherejs.com/deanius/promise' package
 */
export const callWithPromise = (method) => {
    return new Promise((resolve, reject) => {
        Meteor.call(method, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

/**
 * Custom settimeout wrapper within Promise
 */
const sleep = (mS) => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, mS);
    });
};


Template.helloOld.onCreated(function helloOnCreated() {
    // counter starts at 0
    console.log('template created');
    this.counter = new ReactiveVar(0);
    //Create reactive var for array
    this.list = new ReactiveVar([]);
    this.listAsync = new ReactiveVar([]);
    this.listPromise = new ReactiveVar([]);
    console.log('before calling getHobbits');
    // Meteor.call('getHobbits', (error, result) => {
    //     console.log('getHobbits Response received');
    //     console.log(error);
    //     //  console.log(result);
    //     this.list.set(result);
    // });
    // Meteor.call('getHobbitsWithFiber', (error, result) => {
    //     console.log('getHobbits Response received');
    //     console.log(error);
    //     //  console.log(result);
    //     this.list.set(result);
    // });

    console.log('before calling getHobbitsAsync');
    Meteor.call('getHobbitsFinal', (error, result) => {
        console.log('getHobbitsAsync Response received');
        // console.log(error);
        console.log(result);
        this.listAsync.set(result);
    });
    console.log('before calling getHobbitsPromise');

    Meteor.call('getHobbitsPromise', (error, result) => {
        console.log('getHobbitsPromise Response received');
        //console.log(error);
        console.log(result);
        this.listPromise.set(result);
    });
    Meteor.call('getHobbitsError', (error, result) => {
        console.log('getHobbitsError Response received');
        console.log(error);
        //  console.log(result);

    });


});

Template.helloOld.helpers({
    counter() {
        return Template.instance().counter.get();
    },
    hobbits() {
        return Template.instance().list.get();
    },
    hobbitsZsync() {
        return Template.instance().listAsync.get();
    },
    hobbitsPromise() {
        return Template.instance().listPromise.get();
    }
});

Template.promiseHelloWorld.events({
    'click button' (event, instance) {
        // increment the counter when button is clicked
        instance.counter.set(instance.counter.get() + 1);
    },
});

Template.promiseHelloWorld.onCreated(async function helloOnCreated() {
    this.list = new ReactiveVar([]);
    //OLD WAY TO USE async and await in client side meteor
    this.list.set(await callWithPromise('getHobbits'));
});

Template.promiseHelloWorld.helpers({
    hobbits() {
        return Template.instance().list.get();
    },
});



Template.hello.onCreated(async function helloOnCreated() {
    this.list = new ReactiveVar([]);
    this.latestError = new ReactiveVar();
    ////OLD CODE START
    // Meteor.call('assignRing', 1, (error, result) => {
    //     if (error) {
    //         this.latestError.set(error.message);
    //     } else {
    //         Meteor.call('getHobbits', (error, hobbits) => {
    //             if (error) {
    //                 this.latestError.set(error.message);
    //             } else {
    //                 this.list.set(hobbits);
    //                 Meteor.setTimeout(() => {
    //                     Meteor.call('assignRing', 2, (error, result) => {
    //                         if (error) {
    //                             this.latestError.set(error.message);
    //                         } else {
    //                             Meteor.call('getHobbits', (error, hobbits) => {
    //                                 if (error) {
    //                                     this.latestError.set(error.message);
    //                                 } else {
    //                                     this.list.set(hobbits);
    //                                 }
    //                             });
    //                         }
    //                     });
    //                 }, 1000);
    //             }
    //         });
    //     }
    // });

    ////OLD CODE END
    try {
        await Meteor.callPromise('assignRing', 1);
        this.list.set(await Meteor.callPromise('getHobbits'));
        await sleep(1000);
        await Meteor.callPromise('assignRing', 2);
        this.list.set(await Meteor.callPromise('getHobbits'));
    } catch (error) {
        this.latestError.set(error.message);
    }
});

Template.hello.helpers({
    hobbits() {
        return Template.instance().list.get();
    },
    errorMessage() {
        return Template.instance().latestError.get();
    },
});