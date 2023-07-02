import express, { Router, Request, Response } from 'express';
import multerUpload from './multer.upload';
import fs from 'fs';
import path from 'path';
const router: Router = express.Router();
const buildJson = `builds.json`;
type FileRecord = {
    id?: string,
    version?: string,
    filePath?: string,
    active?: boolean
};
router.post('/get', (_req: Request, _res: Response) => {
    try {
        const { version } = _req.body;
        const builds = readFile();
        if (!version) return _res.status(200).json({ build: builds.find(b => b.active) });
        else {
            const build = builds.find((b: FileRecord) => b.version == version)
            return _res.status(200).json({ build })
        }
    } catch (error) {
        console.log('[get].error', error);
        return _res.status(500).json({ statusCode: 500, file: null, message: 'An error accured during file get.', error })
    }
})

router.post('/update', (_req: Request, _res: Response) => {
    try {
        const { version, active } = _req.body;
        const builds = readFile();
        const fileIndex = builds.findIndex((b: FileRecord) => b.version == version);
        if (fileIndex < 0) return _res.status(404).json({ statusCode: 404, message: `Build not found having version ${version}.` })
        else {
            builds[fileIndex] = {
                ...builds[fileIndex],
                active
            }
            fs.writeFileSync(buildJson, JSON.stringify({ builds }), { encoding: 'utf-8' });
            return _res.status(200).json({ message: `Build having version ${version} updated successfully!`, build: builds[fileIndex] })
        }
    } catch (error) {
        console.log('[update].error', error);
        return _res.status(500).json({ statusCode: 500, file: null, message: 'An error accured during file update.', error })
    }
});
router.get('/list', (_req: Request, _res: Response) => {
    try {
        const builds = readFile();
        if (!builds.length) return _res.status(404).json({ statusCode: 404, message: `There is no build is exist in the database.` });
        else return _res.status(200).json({ count: builds.length, message: 'Builds list', builds: builds.reverse() });
    } catch (error) {
        console.log('[list].error', error);
        return _res.status(500).json({ statusCode: 500, file: null, message: 'An error accured during file list.', error })
    }
})
router.post("/upload",
    multerUpload('uploads').single('file'),
    async (_req: Request, _res: Response) => {
        try {
            const version = _req.body.version;
            if (!version) return _res.status(400).json({ statusCode: 400, message: 'Version field is required!' });
            const file = _req.file as Express.Multer.File;
            const active = _req.body.active;
            const record = await writeFile(file.path, _req.body.version || '', active)
            return _res.status(200).json({ ...record, statusCode: 200, message: 'File uploaded successfully!!' })
        } catch (error) {
            return _res.status(500).json({ statusCode: 500, file: null, message: 'An error accured during file upload.', error })
        }
    });
router.post("/download", (_req: Request, _res: Response) => {
    const { version, id } = _req.body;
    const builds = readFile();
    if (!builds.length) return _res.status(404).json({ statusCode: 404, message: 'These is no build exists in the database.' });
    const build = builds.find((b: FileRecord, i: any) => (b.version == version || b.id == id));
    if (!build) return _res.status(404).json({ statusCode: 404, message: `Build Not Found` });
    const buildPath = path.join(__dirname, `${build.filePath}`);
    console.log('buildPath', buildPath);
    return _res.download(buildPath), (error: Error) => {
        if (error) {
            console.log('Download PDF Error:', error);
            return _res.status(500).json({ statusCode: 500, file: null, message: 'An error accured during file download.', error })
        }
        return;
    }
});

export = router;

const writeFile = (filePath: string, version: string, active: boolean): Promise<FileRecord> => {
    return new Promise((resolve, reject) => {
        try {
            let record: FileRecord = {};
            const builds = readFile();
            if (builds.length) {
                const index = builds.findIndex(x => x.version == version);
                if (index >= 0) {
                    builds[index] = {
                        ...builds[index],
                        filePath
                    }
                    fs.writeFileSync(buildJson, JSON.stringify({ builds }), { encoding: 'utf-8' });
                    resolve(builds[index]);
                    return;
                } else record = {
                    id: `${Math.ceil(Math.random() * Date.now())}`,
                    filePath,
                    version,
                    active
                };

            }
            else record = {
                id: `${Math.ceil(Math.random() * Date.now())}`,
                filePath,
                version,
                active
            };
            builds.push(record);
            fs.writeFileSync(buildJson, JSON.stringify({ builds }), { encoding: 'utf-8' });
            resolve(record);
        } catch (error) {
            reject(error)
        }
    })

}

const readFile = (): FileRecord[] => {
    const json = fs.existsSync(buildJson) ? fs.readFileSync(buildJson) : false;
    if (json) {
        const parsedData = JSON.parse(`${json}`);
        return (parsedData.builds as FileRecord[]);
    } else return []
}