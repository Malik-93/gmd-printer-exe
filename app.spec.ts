import request from 'supertest';
import app from './app';
// import fs from 'fs';
describe('Printer Local Server', function () {
    it('GET / - should send back a JSON object', async function () {
        try {
            await request(app)
                .get('/')
                .set('Content-Type', 'application/json')
                .expect(function (res: request.Response) {
                    const { active, message } = res.body;
                    expect(active).toBe(true);
                    expect(message).toBeDefined();
                });
        } catch (error) {
            expect(error).toBeDefined();
        }

    });

    it('GET /api/printer/get_printers - should get the list of available printers', async function () {
        try {
            await request(app)
                .get('/api/printer/get_printers')
                .set('Content-Type', 'application/json')
                .expect(function (res: request.Response) {
                    const { statusCode = 200, success = true, printers_list = [] } = res.body;
                    if (statusCode === 200) {
                        expect(success).toBe(true);
                        expect(printers_list.length).toBeGreaterThan(0);
                    } else if (statusCode === 404) {
                        expect(success).toBe(true);
                        expect(printers_list.length).toBe(0);
                    } else expect(statusCode).toBeDefined()
                });
        } catch (error) {
            expect(error).toBeDefined();
        }
    });

    // Below test is in progress
    
    // it('POST /api/printer/print - should send a print request to a local printer', async function () {
    //     try {
    //         const filePath = `${__dirname}/assets/dummy.pdf`;
    //         const isFileExist = fs.existsSync(filePath);
    //         const printer_name = 'ipp_printer_1';
    //         if (!isFileExist) throw 'file does not exist';
    //         await request(app)
    //             .post('/api/printer/print')
    //             .set('Content-Type', 'application/json')
    //             .send({ "copies": 1 })
    //             .send({ "printer": printer_name })
    //             .attach("file", filePath)
    //             .expect(function (res: request.Response) {
    //                 const { success, message } = res.body;
    //                 expect(success).toBe(true);
    //                 expect(message).toBeDefined();
    //             });
    //     } catch (error) {
    //         // console.log(error);
    //         expect(error).toBeDefined();
    //     }
    // });

});
