import VuexPersistence from 'vuex-persist';

export default ({ store }: any) => {
    // const log = console.log;
    //
    // console.log = function () {
    //     const first_parameter = arguments[0];
    //     const other_parameters = Array.prototype.slice.call(arguments, 1);
    //
    //     function formatConsoleDate(date) {
    //         const hour = date.getHours();
    //         const minutes = date.getMinutes();
    //         const seconds = date.getSeconds();
    //         const milliseconds = date.getMilliseconds();
    //
    //         return (
    //             '[' +
    //             (hour < 10 ? '0' + hour : hour) +
    //             ':' +
    //             (minutes < 10 ? '0' + minutes : minutes) +
    //             ':' +
    //             (seconds < 10 ? '0' + seconds : seconds) +
    //             '.' +
    //             ('00' + milliseconds).slice(-3) +
    //             '] '
    //         );
    //     }
    //
    //     log.apply(
    //         console,
    //         [formatConsoleDate(new Date()), first_parameter].concat(
    //             other_parameters,
    //         ),
    //     );
    // };

    new VuexPersistence({
        modules: ['version', 'ordering', 'misc', 'panel'],
    }).plugin(store);
};
