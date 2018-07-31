const chalk = require('chalk')
const inquirer = require('inquirer')

const exec = async ({
  checkBefore = async () => {},
  info,
  disabledService = () => false,
  validateService = () => true,
}) => {
  try {
    const checks = await checkBefore()
    console.log(chalk.blue('All checks passed, intializing…'))

    const { services, editAll, editSingle } = inquirer.prompt([
      {
        type: 'checkbox',
        message: `Which services do you want to launch`,
        name: 'services',
        choices: Object.keys(info).map(s => {
          const { dependency } = servicesInfo[s]
          return {
            name: s,
            checked: s === 'pixeden-data',
            disabled: disabledService(checks),
          }
        }),
        validate: validateService,
      },
      {
        type: 'confirm',
        message: `Do you want to open all services in Code Editor?`,
        name: 'editAll',
        default: true,
        when: answers => {
          return answers.services.length
        },
      },
      {
        type: 'checkbox',
        message: 'Which services to open in Editor',
        name: 'editSingle',
        choices: answers => answers.services.map(s => s),
        when: answers => {
          return answers.services.length && !answers.editAll
        },
      },
    ])

    if (services.length > 0) {
      for (let service of services) {
        const { path, script } = info[service]
        await openTab(`cd ${path} && ${script}`, service)
        console.log(chalk.blue(`> Service ${service} opened`))
        if (editAll || (!editAll && editSingle.includes(service))) {
          await openEditor(path)
        }
      }
      process.exit()
    } else {
      throw 'Bye Bye!'
    }
  } catch (err) {
    console.log(chalk.bold.red(err))
    process.exit()
  }
}

exec()
