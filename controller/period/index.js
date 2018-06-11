const utilities = require('../../commons/utilities');
const httpStatus = require('../../commons/http_status_codes')
const errors = require('../../commons/errors');
const co = require('co');
const connectToDatabase = require('../../commons/database');
const moment = require('moment')

var periodController = function(periodSchema) {
        /**
     * Get all period in database
     * @param {object} req
     * @param {object} res
     */
    async function getAll(req, res) {
        try {
            await connectToDatabase();
            let items = await periodSchema.find().exec();
            let result = [];

            moment.updateLocale(moment.locale(), {invalidDate: " "});

            for(var i = 0; i < items.length; i += 1) {
                let period = {
                    _id: items[i]._id,
                    description: items[i].description,
                    initialdate: moment(items[i].initialdate).format('D/M/YYYY'),
                    finaldate: moment(items[i].finaldate).format('D/M/YYYY'),
                    closuredate: moment(items[i].closuredate).format('D/M/YYYY'),
                    generationdate: moment(items[i].generationdate).format('D/M/YYYY'),
                }
                result.push(period);
            }
            res.status(httpStatus.Ok).json(result);
        } catch(e) {
            res.status(httpStatus.InternalServerError).send('Erro:' + e);
        }
    }

    // /**
    //  * Creates a new period
    //  * @param {object} req The Express Request object
    //  * @param {object} res The Express Response object
    //  */
    async function create(req, res) {
        const initialspltdate = req.body.initialdate.split(' ');
        const initialyear = parseInt(initialspltdate[2]);
        const initialmonth = parseInt(initialspltdate[1] - 1);
        const initialday = parseInt(initialspltdate[0]);

        const finalspltdate = req.body.finaldate.split(' ');
        const finalyear = parseInt(finalspltdate[2]);
        const finalmonth = parseInt(finalspltdate[1] - 1);
        const finalday = parseInt(finalspltdate[0]);

        const descriptionUpperCase = moment(req.body.description).locale('pt-BR').format('MMMM/YYYY');

        await connectToDatabase();
        let newperiod = new periodSchema({
            description: descriptionUpperCase.charAt(0).toUpperCase() + descriptionUpperCase.slice(1),
            initialdate: new Date(initialyear, initialmonth, initialday),
            finaldate: new Date(finalyear, finalmonth, finalday),
            closuredate: null,
            generationdate: null,
            isActive: true,
        });

        newperiod.save(function (err) {
            if(err) {
                res.status(httpStatus.InternalServerError).res.send('Erro:' + err);
            }
            else{
                res.status(httpStatus.Created).end();
            }
        });
    }

    // /**
    //  * Delete a Period
    //  * @param {object} req The Express Request object
    //  * @param {object} res The Express Response object
    //  */
    async function delete_period(req, res) {
        await connectToDatabase();
        const result = await periodSchema.findByIdAndRemove(req.body.id);
        result.save(function (err){
            if(err) {
                res.status(httpStatus.InternalServerError).send('Erro ao remover período');
            }
            else {
                res.status(httpStatus.Ok).send('Período removido com sucesso');
            }
        });
    }

    return {
        getAll: getAll,
        create: create,
        delete_period: delete_period
    }
}

module.exports = periodController;

// /**
//  * Close a Period
//  * @param {object} req The Express Request object
//  * @param {object} res The Express Response object
//  */
// function closureDate(req, res) {
//     const closurespltdate = req.body.closuredate.split(' ');
//     const closureDateRegister = new Date(parseInt(closurespltdate[2]), parseInt(closurespltdate[1] - 1), parseInt(closurespltdate[0]) );

//     if (!req.body.id) res.send('Erro: object id not specified');
//     else connectToDatabase().then(() => {
//         co(function* () {
//             const result = yield periodSchema.findByIdAndUpdate(req.body.id, update = {closuredate: closureDateRegister , isActive: true}, {new: true});
//             result.save().then(awdas => {
//                 res.status(httpStatus.Ok).end();
//             }).catch((error) => {
//                 res.send('Erro:' + error);
//             });
//         }).catch((error) => {
//             res.send('Erro:' + error);
//         });
//     });
// }

// /**
//  * Close a Period
//  * @param {object} req The Express Request object
//  * @param {object} res The Express Response object
//  */
// function generationDate(req, res) {
//     const generationpltdate = req.body.generationdate.split(' ');
//     const generationDateRegister = new Date(parseInt(generationpltdate[2]), parseInt(generationpltdate[1] - 1), parseInt(generationpltdate[0]) );

//     if (!req.body.id) res.send('Erro: object id not specified');
//     else connectToDatabase().then(() => {
//         co(function* () {
//             const result = yield periodSchema.findByIdAndUpdate(req.body.id, update = {generationdate: generationDateRegister , isActive: true}, {new: true});
//             result.save().then(awdas => {
//                 res.status(httpStatus.Ok).end();
//             }).catch((error) => {
//                 res.send('Erro:' + error);
//             });
//         }).catch((error) => {
//             res.send('Erro:' + error);
//         });
//     });
// }


// module.exports = {
//     getAll,
//     create,
//     delete_period,
//     closureDate,
//     generationDate,
// }
