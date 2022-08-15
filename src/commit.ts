#!/usr/bin/env node
import { exec, execSync, spawn } from "child_process";
import * as core from '@actions/core'

export function commitBasline (parameters)  {

    if ( parameters.store_baseline_file_branch == "" || parameters.create_baseline_from == "" ){
        core.info('To store a baseline file you need to set the parameters "store_baseline_file_branch" and "create_baseline_from" in order to work correctly')
    }
    else {
        core.info('Creating git command to push file')

        let baselineFileName = ""
        if( parameters.create_baseline_from == "standard"){
            baselineFileName = "results.json"
        }
        else if ( parameters.create_baseline_from == "filtered" ){
            baselineFileName = "filtered_results.json"
        }

        core.info('Baseline from : '+baselineFileName)

        let gitCommand = `git config --global user.name "${ env.CI_COMMIT_AUTHOR }"
                            git config --global user.email "username@users.noreply.github.com"
                            git pull
                            git add -f "${baselineFileName}"
                            git commit -a -m "Veracode Baseline File push from pipeline"
                            git push origin HEAD:"${parameters.store_baseline_file_branch}"
                            `

        core.info('Git Command: '+gitCommand)
        
        if (parameters.debug == 1 ){
            core.info('---- DEBUG OUTPUT START ----')
            core.info('---- commit.ts / commitBasline() ----')
            core.info('Git Command: '+gitCommand)
            core.info('---- DEBUG OUTPUT END ----')
        }
        
        
        let commandOutput = ''
        try {
            execSync(gitCommand)
        } catch (ex){
            commandOutput = ex.stdout.toString()
        }
        return commandOutput
    }



}