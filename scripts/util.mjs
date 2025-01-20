import { exec } from 'child_process';
import fs from 'fs';
import  open from 'open';

export const getBranchName = () => {
    return new Promise((resolve, reject) => {
        exec('git branch --show-current', (err, stdout, stderr) => {
        if (err) {
            reject(err);
        } else {
            resolve(stdout.trim());
        }
        });
    });
};

export const getRepoName = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('package.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                const packageJson = JSON.parse(data);
                resolve(packageJson.repository);
            }
        });
    });
};

export const openUrl = (url) => {
    open(url);
};