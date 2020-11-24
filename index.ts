import { Client, MessageEmbedOptions, TextChannel } from 'discord.js'
import * as dotenv from 'dotenv'

const embeds: {
  [id: string]: MessageEmbedOptions
} = require('./json/embeds.json')
const setEmbedTimestamp = (e: MessageEmbedOptions) => {
  e.timestamp = new Date()
  return e
}

const envToRun = process.argv[2]
const bot = JSON.parse(dotenv.config().parsed![envToRun])

const livebotGuilds = ['770232718339604522', '671494961577066498']
const client = new Client()

client.on('ready', () => {
  console.log(
    `┌──────────────${'─'.repeat(client.user!.tag.length)}─┬────────────┐\n` +
      `│ Logged in as ${client.user!.tag} │ I'm ready! │\n` +
      `└──────────────${'─'.repeat(client.user!.tag.length)}─┴────────────┘\n`
  )
  client.guilds.cache.forEach((g) => {
    if (envToRun === 'production') {
      if (!livebotGuilds.includes(g.id)) g.leave()
    }
  })
})

client.on('guildCreate', (guild) => {
  if (envToRun === 'production') {
    if (!livebotGuilds.includes(guild.id)) guild.leave()
  }
})

client.on('guildMemberAdd', async (member) => {
  if (member.user.bot) return
  try {
    member.send({
      embed: setEmbedTimestamp(embeds.welcome_message),
    })
  } catch (_error) {
    const channel = (await client.channels.fetch(
      '777890193003905034'
    )) as TextChannel
    channel.send(
      `${member} Sorry, but I couldn't send you a DM.\nPlease check the privacy setting and make sure "Allow direct messages from server members." is turned on.`,
      {
        embed: setEmbedTimestamp(embeds.how_to_allow_dm_from_bot),
      }
    )
  }
})

client.on('message', async (msg) => {
  if (
    msg.author.bot ||
    (msg.channel.type !== 'dm' && msg.channel.id !== '777890193003905034')
  )
    return

  if (msg.channel.id === '777890193003905034')
    try {
      await msg.author.send({
        embed: setEmbedTimestamp(embeds.welcome_message),
      })
      const channel = (await client.channels.fetch(
        '777890193003905034'
      )) as TextChannel
      const sent = await channel.send(':white_check_mark: Help message sent')
      sent.delete({ timeout: 3000 })
    } catch (_error) {
      const channel = (await client.channels.fetch(
        '777890193003905034'
      )) as TextChannel
      channel.send(
        `${msg.author} Sorry, but I couldn't send you a DM.\nPlease check the privacy setting and make sure "Allow direct messages from server members." is turned on.`,
        {
          embed: setEmbedTimestamp(embeds.how_to_allow_dm_from_bot),
        }
      )
    }

  if (msg.channel.type === 'dm') {
    if (!embeds[msg.content]) return
    msg.channel.send({ embed: embeds[msg.content] })
  }
})

client.login(bot.token)
