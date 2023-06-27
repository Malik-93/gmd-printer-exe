import express, { Router, Request, Response } from 'express';
import multerUpload from './multer.upload';
import fs from 'fs';
import path from 'path';
const router: Router = express.Router();
const buildJson = `builds.json`;
type FileRecord = {
    id?: string,
    version?: string,
    filePath?: string
};
router.post("/upload",
    multerUpload('uploads').single('file'),
    async (_req: Request, _res: Response) => {
        try {
            const file = _req.file as Express.Multer.File;
            const record = await writeFile(file.path, _req.body.version || '')
            return _res.status(200).json({ ...record, statusCode: 200, message: 'File uploaded successfully!!' })
        } catch (error) {
            return _res.status(500).json({ statusCode: 500, file: null, message: 'An error accured during file upload.', error })
        }
    });
router.post("/download", (_req: Request, _res: Response) => {
    const { version, id } = _req.body;
    const json = fs.existsSync(buildJson) ? fs.readFileSync(buildJson) : false;
    if (!json) return _res.status(404).json({ statusCode: 404, message: 'These is no build exists in the database.' });
    const { builds } = JSON.parse(`${json}`);
    const build = builds.find((b: { version: any; id: any; }, i: any) => (b.version == version || b.id == id));
    if (!build) return _res.status(404).json({ statusCode: 404, message: `Build Not Found` });
    const buildPath = path.join(__dirname, `${build.filePath}`);
    console.log('buildPath',buildPath);
    return _res.download(buildPath), (err: Error) => {
        if (err) console.log('Download PDF Error:', err);
        return;
    }
});
export = router;

const writeFile = (filePath: string, version: string): Promise<FileRecord> => {
    return new Promise((resolve, reject) => {
        try {
            let record: FileRecord = {};
            let builds: FileRecord[] = [];
            const json = fs.existsSync(buildJson) ? fs.readFileSync(buildJson) : false;
            if (json) {
                const parsedData = JSON.parse(`${json}`);
                builds = parsedData.builds;
                const index = builds.findIndex(x => x.version == version);
                if (index >= 0) {
                    builds[index] = {
                        ...builds[index],
                        filePath
                    }
                    fs.writeFileSync(buildJson, JSON.stringify({ builds }), { encoding: 'utf-8' });
                    resolve(builds[index])
                    return;
                } else record = {
                    id: `${Math.ceil(Math.random() * Date.now())}`,
                    filePath,
                    version,
                };

            }
            else record = {
                id: `${Math.ceil(Math.random() * Date.now())}`,
                filePath,
                version,
            };
            builds.push(record);
            fs.writeFileSync(buildJson, JSON.stringify({ builds }), { encoding: 'utf-8' });
            resolve(record);
        } catch (error) {
            reject(error)
        }
    })

}