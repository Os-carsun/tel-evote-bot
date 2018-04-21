
const Telegraf = require('telegraf')
const { Markup } = Telegraf
const session = require('telegraf/session')

const bot = new Telegraf('process.env.BOT_TOKEN')
//const bot = new Telegraf('')
bot.use(session())

bot.start((ctx) => {
    ctx.is_vote = false
    ctx.reply('/vote to start a new vote')
})
bot.help((ctx) => ctx.reply("/vote {name} to start a new vote\n/done to end vote\n/add  {option} to add option"))

bot.command('/vote', (ctx) => {
    if(ctx.session.is_vote) {
        ctx.reply('is voting /done first')
        return
    }
    ctx.session.is_vote = true
    ctx.session.options = []
    ctx.session.result = {}
    const name = ctx.message.text.replace('/vote', '')

    if(name.length > 0) {
        ctx.session.vote_name = name
        ctx.reply('start a new vote ' + name)
    }
    else{
        ctx.session.vote_name = 'vote'
        ctx.reply('start a new vote')    
    }
})


const add_option = (options) => Telegraf.Extra
    .markdown()
    .markup((m) => m.keyboard(
        options.map((text)=>m.callbackButton('vote ' + text))
    ).resize())

const result_menu = (data) => Telegraf.Extra
    .HTML()
    

bot.command('/add', (ctx) => {
    if(!ctx.session.is_vote) {
        ctx.reply('/vote first')
        return
    }
    const option = ctx.message.text.replace('/add','')

    if(ctx.session.options.indexOf(option) === -1)
        ctx.session.options.push(option)
    
    ctx.reply(ctx.message.text, add_option(ctx.session.options)) 
})

bot.hears(/vote/i, (ctx) => {
    const msg = ctx.message.text.replace('vote ', '')
    if(!msg) return 
    if(ctx.session.options.indexOf(msg) >= 0) {
        let result = ctx.session.vote_name + ":\n"
        ctx.session.result[msg] = ~~ctx.session.result[msg] + 1
        for(let key of ctx.session.options) { 
            result += `${key}: ${ctx.session.result[key]?ctx.session.result[key]:0}\n`
        }
        ctx.reply(`${result}`)
    }
})

bot.command('/done', (ctx) => {
    if(!ctx.session.is_vote) {
        ctx.reply('/vote first')
        return
    }
    ctx.reply('end this vote', Markup.removeKeyboard().extra())
    let result = ctx.session.vote_name + ":\n"
    for(let key of ctx.session.options) { 
        result += `${key}: ${ctx.session.result[key]?ctx.session.result[key]:0}\n`
    }
    ctx.reply(`${result}`)
    ctx.session.is_vote = false
})

bot.hears('好猛喔', (ctx) => ctx.reply('馬的幹話王'))

bot.catch((err) => {
    console.log('QQ', err)
})



bot.startPolling()
