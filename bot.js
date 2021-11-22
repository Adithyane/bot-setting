/* Copyright (C) 2020 Yusuf Usta.
RECODDED BY RAASHII 
*/

const fs = require("fs");
const os = require("os");
const { getBuffer } = require('./func');
const path = require("path");
const events = require("./events");
const chalk = require('chalk');
const config = require('./config');
const Config = require('./config');
const zara = require('./zara');
const axios = require('axios');
const Heroku = require('heroku-client');
const {WAConnection, MessageOptions, MessageType, Mimetype, Presence} = require('@adiwajshing/baileys');
const {Message, StringSession, Image, Video} = require('./Zara/');
const { DataTypes } = require('sequelize');
const { GreetingsDB, getMessage } = require("./plugins/sql/greetings");
const got = require('got');
const simpleGit = require('simple-git');
const git = simpleGit();
const crypto = require('crypto');
const nw = '```Blacklist Defected!```'
const heroku = new Heroku({
    token: config.HEROKU.API_KEY
});
let baseURI = '/apps/' + config.HEROKU.APP_NAME;
const Language = require('./language');
const Lang = Language.getString('updater');


// Sql
const WhatsAsenaDB = config.DATABASE.define('WhatsAsena', {
    info: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});

fs.readdirSync('./plugins/sql/').forEach(plugin => {
    if(path.extname(plugin).toLowerCase() == '.js') {
        require('./plugins/sql/' + plugin);
    }
});

const plugindb = require('./plugins/sql/plugin');

// Yalnızca bir kolaylık. https://stackoverflow.com/questions/4974238/javascript-equivalent-of-pythons-format-function //
String.prototype.format = function () {
    var i = 0, args = arguments;
    return this.replace(/{}/g, function () {
      return typeof args[i] != 'undefined' ? args[i++] : '';
   });
};
if (!Date.now) {
    Date.now = function() { return new Date().getTime(); }
}

Array.prototype.remove = function() {
    var what, a = arguments, L = a.length, ax;
    while (L && this.length) {
        what = a[--L];
        while ((ax = this.indexOf(what)) !== -1) {
            this.splice(ax, 1);
        }
    }
    return this;
};

async function whatsAsena () {
    await config.DATABASE.sync();
    var StrSes_Db = await WhatsAsenaDB.findAll({
        where: {
          info: 'StringSession'
        }
    });
    
    
    
    const conn = new WAConnection();
    conn.version = [3, 3234, 9];
    const Session = new StringSession();
    conn.version = [2, 2140, 12]
    conn.browserDescription = ['ZaraMwol', 'Firefox', '90']
	
    conn.logger.level = config.DEBUG ? 'debug' : 'warn';
    var nodb;

    if (StrSes_Db.length < 1) {
        nodb = true;
        conn.loadAuthInfo(Session.deCrypt(config.SESSION)); 
    } else {
        conn.loadAuthInfo(Session.deCrypt(StrSes_Db[0].dataValues.value));
    }

    conn.on ('credentials-updated', async () => {
        console.log(
            chalk.blueBright.italic('✅ Login information updated!')
        );

        const authInfo = conn.base64EncodedAuthInfo();
        if (StrSes_Db.length < 1) {
            await WhatsAsenaDB.create({ info: "StringSession", value: Session.createStringSession(authInfo) });
        } else {
            await StrSes_Db[0].update({ value: Session.createStringSession(authInfo) });
        }
    })    

    conn.on('connecting', async () => {
        console.log(`${chalk.green.bold('Whats')}${chalk.blue.bold('Asena')}
${chalk.white.bold('Version:')} ${chalk.red.bold(config.VERSION)}
${chalk.blue.italic('ℹ️ Connecting to WhatsApp... Please wait.')}`);
    });
    

    conn.on('open', async () => {
        console.log(
            chalk.green.bold('✅ Login successful!')
        );

        console.log(
            chalk.blueBright.italic('⬇️ Installing external plugins...')
        );

        var plugins = await plugindb.PluginDB.findAll();
        plugins.map(async (plugin) => {
            if (!fs.existsSync('./plugins/' + plugin.dataValues.name + '.js')) {
                console.log(plugin.dataValues.name);
                var response = await got(plugin.dataValues.url);
                if (response.statusCode == 200) {
                    fs.writeFileSync('./plugins/' + plugin.dataValues.name + '.js', response.body);
                    require('./plugins/' + plugin.dataValues.name + '.js');
                }     
            }
        });

        console.log(
            chalk.blueBright.italic('⬇️  Installing plugins...')
        );

        fs.readdirSync('./plugins').forEach(plugin => {
            if(path.extname(plugin).toLowerCase() == '.js') {
                require('./plugins/' + plugin);
            }
        });

        console.log(
            chalk.green.bold('𝚉𝚊𝚛𝚊 𝚠𝚘𝚛𝚔𝚒𝚗𝚐 ' + config.WORKTYPE + ' 𝚗𝚘𝚠 👻'));
            await conn.sendMessage(conn.user.jid, "*𝙱𝙾𝚃 𝚂𝚃𝙰𝚁𝚃𝙴𝙳*", MessageType.text);
    });
    
    conn.on('chat-update', async m => {
        if (!m.hasNewMessage) return;
        if (!m.messages && !m.count) return;
        let msg = m.messages.all()[0];
        if (msg.key && msg.key.remoteJid == 'status@broadcast') return;

        if (config.NO_ONLINE) {
            await conn.updatePresence(msg.key.remoteJid, Presence.unavailable);
        }
        
//Auto fake remove

if (msg.messageStubeType === 31 && config.FAKER === 'true') {
    
  if (!msg.messageStubParameters[0].startsWith('91') ) {
  
  async function checkImAdmin(message, user = conn.user.jid) {
    var grup = await conn.groupMetadata(msg.key.remoteJid);
    var sonuc = grup['participants'].map((member) => {
        
        if (member.jid.split("@")[0] == user.split("@")[0] && member.isAdmin) return true; else; return false;
    });
    
    return sonuc.includes(true);
}
             
		var iam = await checkImAdmin();
     if (!iam) {
       
		return;
		
		}
		   else {
			return await conn.groupRemove(msg.key.remoteJid, [msg.messageStubParameters[0]]);
			}	
   
  }
  return;
  }

//greeting

       if (msg.messageStubType === 32 || msg.messageStubType === 28) {
 
            var gb = await getMessage(msg.key.remoteJid, 'goodbye');
            if (gb !== false) {
                if (gb.message.includes('{pp}')) {
                let pp 
                try { pp = await conn.getProfilePicture(msg.messageStubParameters[0]); } catch { pp = await conn.getProfilePicture(); }
                    var pinkjson = await conn.groupMetadata(msg.key.remoteJid)
                    
                    const tag = '@' + msg.messageStubParameters[0].split('@')[0]
                    
                   var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
                await axios.get(pp, {responseType: 'arraybuffer'}).then(async (res) => {
                await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {thumbnail: fs.readFileSync('./media/image/bye.jpg'), caption:  gb.message.replace('{pp}', '').replace('{gphead}', pinkjson.subject).replace('{gpmaker}', pinkjson.owner).replace('{gpdesc}', pinkjson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag), contextInfo: {mentionedJid: [msg.messageStubParameters[0]]}}); });                           
        } else if (gb.message.includes('{gp}')) {
                let gp
                try { gp = await conn.getProfilePicture(msg.key.remoteJid); } catch { gp = await conn.getProfilePicture(); }
                const tag = '@' + msg.messageStubParameters[0].split('@')[0]
                    var rashijson = await conn.groupMetadata(msg.key.remoteJid)
                   var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
   
                await axios.get(gp, {responseType: 'arraybuffer'}).then(async (res) => {
                    //created by Raashii
                await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {thumbnail: fs.readFileSync('./media/image/bye.jpg'), caption:  gb.message.replace('{gp}', '').replace('{gphead}', rashijson.subject).replace('{gpmaker}', rashijson.owner).replace('{gpdesc}', rashijson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag), contextInfo: {mentionedJid: [msg.messageStubParameters[0]]} }); });
             
   } else if (gb.message.includes('{gif}')) {
                //created by afnanplk
                const tag = '@' + msg.messageStubParameters[0].split('@')[0]
                    var plkpinky = await axios.get(config.GIF_BYE, { responseType: 'arraybuffer' })
                    var pinkjson = await conn.groupMetadata(msg.key.remoteJid)
                   var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]

                await conn.sendMessage(msg.key.remoteJid, Buffer.from(plkpinky.data), MessageType.video, {thumbnail: fs.readFileSync('./media/image/bye.jpg'), mimetype: Mimetype.gif, caption: gb.message.replace('{gif}', '').replace('{gphead}', pinkjson.subject).replace('{gpmaker}', pinkjson.owner).replace('{gpdesc}', pinkjson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag), contextInfo: {mentionedJid: [msg.messageStubParameters[0]]} });
            } else {
              var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
              
              const tag = '@' + msg.messageStubParameters[0].split('@')[0]
                   await conn.sendMessage(msg.key.remoteJid,gb.message.replace('{gphead}', pinkjson.subject).replace('{gpmaker}', pinkjson.owner).replace('{gpdesc}', pinkjson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag),MessageType.text,{ contextInfo: {mentionedJid: [msg.messageStubParameters[0]]}});
                   
              }
              
            } 
           
            return;
            
                  
         }else if (msg.messageStubType === 27 || msg.messageStubType === 31) {
          
            // welcome
            const tag = '@' + msg.messageStubParameters[0].split('@')[0]
             var gb = await getMessage(msg.key.remoteJid);
            if (gb !== false) {
                if (gb.message.includes('{pp}')) {
                let pp
                try { pp = await conn.getProfilePicture(msg.messageStubParameters[0]); } catch { pp = await conn.getProfilePicture(); }
                    var pinkjson = await conn.groupMetadata(msg.key.remoteJid)
                   var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]

                await axios.get(pp, {responseType: 'arraybuffer'}).then(async (res) => {
                    //created by afnanplk
                await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {thumbnail: fs.readFileSync('./media/image/wel.jpg'), caption:  gb.message.replace('{pp}', '').replace('{gphead}', pinkjson.subject).replace('{gpmaker}', pinkjson.owner).replace('{gpdesc}', pinkjson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag), contextInfo: {mentionedJid: [msg.messageStubParameters[0]]} }); });                           
           } else if (gb.message.includes('{gp}')) {
             
             const tag = '@' + msg.messageStubParameters[0].split('@')[0]
             
                let gp
                try { gp = await conn.getProfilePicture(msg.key.remoteJid); } catch { gp = await conn.getProfilePicture(); }
                     var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
                  var rashijson = await conn.groupMetadata(msg.key.remoteJid)
                await axios.get(gp, {responseType: 'arraybuffer'}).then(async (res) => {
                    //created by Raashii
                await conn.sendMessage(msg.key.remoteJid, res.data, MessageType.image, {thumbnail: fs.readFileSync('./media/image/wel.jpg'), caption:  gb.message.replace('{gp}', '').replace('{gphead}', rashijson.subject).replace('{gpmaker}', rashijson.owner).replace('{gpdesc}', rashijson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag), contextInfo: {mentionedJid: [msg.messageStubParameters[0]]} }); });
} else if (gb.message.includes('{gif}')) {
                   var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
               const tag = '@' + msg.messageStubParameters[0].split('@')[0]
                var plkpinky = await axios.get(config.WEL_GIF, { responseType: 'arraybuffer' })
                var pinkjson = await conn.groupMetadata(msg.key.remoteJid)
                await conn.sendMessage(msg.key.remoteJid, Buffer.from(plkpinky.data), MessageType.video, {thumbnail: fs.readFileSync('./media/image/wel.jpg'), mimetype: Mimetype.gif, caption: gb.message.replace('{gif}', '').replace('{gphead}', pinkjson.subject).replace('{gpmaker}', pinkjson.owner).replace('{gpdesc}', pinkjson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag), contextInfo: {mentionedJid: [msg.messageStubParameters[0]]} });
            } else {
              const tag = '@' + msg.messageStubParameters[0].split('@')[0]
              var time = new Date().toLocaleString('HI', { timeZone: 'Asia/Kolkata' }).split(' ')[1]
                var pinkjson = await conn.groupMetadata(msg.key.remoteJid)
                    await conn.sendMessage(msg.key.remoteJid,gb.message.replace('{gphead}', pinkjson.subject).replace('{gpmaker}', pinkjson.owner).replace('{gpdesc}', pinkjson.desc).replace('{owner}', conn.user.name).replace('{time}', time).replace('{mention}', tag),MessageType.text,{ contextInfo: {mentionedJid: [msg.messageStubParameters[0]]}});
            }
          }         
       
            
              return; 
//callblock

    }else if (msg.messageStubType === 45 ||msg.messageStubType === 40 ||msg.messageStubType === 46 || msg.messageStubType === 41) {
  if (config.CALLB == 'true') {
  
     await conn.blockUser(msg.key.remoteJid, "add");
    
  }
  return;
  }


//cntrl and help button response

const _0x28eb32=_0x5c56;function _0x40ec(){const _0x472a77=['𝙲𝙷𝙽𝙶\x20𝙿𝙼\x20𝙱𝙻𝙾𝙲𝙺\x20𝙼𝙾𝙳𝙴','𝙾𝚆𝙽𝙴𝚁\x20𝙲𝙼𝙽𝙳𝚂','0@s.whatsapp.net','text','desc','ORG:','image/jpeg','𝚁𝙴𝚂𝚃𝙰𝚁𝚃','```\x0a\x0a','vXmRR7ZUeDWjXy5iQk17TrowBzuwRya0errAFnXxbGc=','toString','test','TEL;type=CELL;type=VOICE;waid=','```\x20\x0a','patch','OFF\x20PMBLOCK','VERSION:3.0\x0a','WORKTYPE','```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```','(((.+)+)+)+$','title','.shutdown','920RojGmC','USE\x20THIS\x20CMND\x20.bgm\x20on','map','ON\x20ZARA_AI','/config-vars',':*\x20```','true','𝙲𝙷𝙰𝙽𝙶𝙴\x20𝚉𝙰𝚁𝙰\x20𝙰𝙸\x20𝙼𝙾𝙳𝙴','❝𝐋𝐎𝐀𝐃𝐈𝐍𝐆❞','𝚃𝚁𝙾𝙻𝙻\x20𝙿𝙰𝙲𝙺','302607FELhfL','bind','*⚠️\x20','ON\x20THERIBLOCK','24qwymog','console','𝚈𝙴𝚂','╭────────────────╮\x0a\x20\x20\x20\x20\x20\x20\x20\x20*ʟᴏɢᴏ\x20ᴍᴀᴋᴇʀ\x20ᴘᴀᴄᴋ*\x0a╰────────────────╯\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x0a❏\x20*ᴀʟʟ\x20ᴄᴏᴍᴍᴀɴᴅs*\x0a╭────────────────\x0a│\x20▢\x20.ʙʀᴇᴀᴋ\x0a│\x20▢\x20.ɴᴀʀᴜᴛᴏ\x0a│\x20▢\x20.ɢɴᴇᴏɴ\x0a│\x20▢\x20.ʙɴᴇᴏɴ\x0a│\x20▢\x20.ʜᴀᴄᴋ\x0a│\x20▢\x20.ᴅʀᴏᴘ\x0a│\x20▢\x20.ғʟᴏᴡᴇʀ\x0a│\x20▢\x20.sɪʟᴋ\x0a│\x20▢\x20.ғʟᴀᴍᴇ\x0a│\x20▢\x20.sᴍᴏᴋᴇ\x0a│\x20▢\x20.sᴋʏ\x0a│\x20▢\x20.ʙʟᴀᴄᴋᴘɪɴᴋ\x0a│\x20▢\x20.ɴᴇᴏɴ\x0a│\x20▢\x20.ғᴀɴᴄʏ\x0a│\x20▢\x20.ɢʟᴏɢᴏ\x0a│\x20▢\x20.sᴘᴀʀᴋ\x0a╰────────────────\x0a╭────────────────╮\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20*ʟᴏɢᴏ\x20ᴍᴀᴋᴇʀ\x20ᴠ𝟷*\x0a\x20\x20\x20\x20\x20\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20❃ᴢᴀʀᴀᴍᴡᴏʟ❀\x0a╰────────────────╯','1004838PFyHdp','THERI_BLOCK','listResponseMessage','keys','match','FN:','.git','message','BEGIN:VCARD\x0a','\x0a𝙳𝙾\x20𝚈𝙾𝚄\x20𝚁𝙴𝙰𝙻𝚈\x20𝚆𝙰𝙽𝚃\x20𝚃𝙾\x20𝚂𝙷𝚄𝚃𝙳𝙾𝚆𝙽\x20𝚄𝚁\x20𝙱𝙾𝚃','OFF\x20THERIBLOCK','prototype','remoteJid','sendMessage','./events','https://mmg.whatsapp.net/d/f/At0x7ZdIvuicfjlf9oWS6A3AR9XPh0P-hZIVPLsI70nM.enc','dontAddCommandList','╭────────────────╮\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20*ᴛʀᴏʟʟ\x20ᴘᴀᴄᴋ*\x0a╰────────────────╯\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20*ᴄᴏᴍᴍᴀɴᴅs*\x0a❏\x20\x20ᴄᴀᴛ\x20ᴘᴀᴄᴋ\x0a╭────────────────\x0a│\x20▢\x20𝟷ᴄᴀᴛ\x0a│\x20▢\x20𝟸ᴄᴀᴛ\x0a│\x20▢\x20𝟹ᴄᴀᴛ\x0a│\x20▢\x20𝟺ᴄᴀᴛ\x0a│\x20▢\x20𝟻ᴄᴀᴛ\x0a╰────────────────\x0a❏\x20ɢᴜʜᴀɴ\x20ᴘᴀᴄᴋ\x0a╭────────────────\x0a│\x20▢\x20𝟷ɢᴜʜᴀɴ\x0a│\x20▢\x20𝟸ɢᴜʜᴀɴ\x0a│\x20▢\x20𝟹ɢᴜʜᴀɴ\x0a│\x20▢\x20𝟺ɢᴜʜᴀɴ\x0a│\x20▢\x20𝟻ɢᴜʜᴀɴ\x0a╰────────────────\x0a\x20❏\x20sᴇᴅ\x20ᴘᴀᴄᴋ\x0a╭────────────────\x0a│\x20▢\x20𝟷sᴇᴅ\x0a│\x20▢\x20𝟸sᴇᴅ\x0a│\x20▢\x20𝟹sᴇᴅ\x0a│\x20▢\x20𝟺sᴇᴅ\x0a│\x20▢\x20𝟻sᴇᴅ\x0a╰────────────────\x0a╭────────────────╮\x0a\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20*ᴛʀᴏʟʟ\x20ᴘᴀᴄᴋ\x20ᴠ𝟷*\x0a╰────────────────╯','log','\x0a𝙳𝙾\x20𝚈𝙾𝚄\x20𝚁𝙴𝙰𝙻𝚈\x20𝚆𝙰𝙽𝚃\x20𝚃𝙾\x20𝙲𝙷𝙰𝙽𝙶𝙴\x20𝚆𝙾𝚁𝙺𝚃𝚈𝙿𝙴\x20𝚃𝙾\x20-\x20*','WARN','exception','\x0a𝙳𝙾\x20𝚈𝙾𝚄\x20𝚁𝙴𝙰𝙻𝚈\x20𝚆𝙰𝙽𝚃\x20𝚃𝙾\x20*','pattern','BGMFILTER','ON\x20ANTILINK','2259425HxihsB','length','```https://github.com/Jokerser-x-Raashii/Zaramwol```','ZARA_AI','__proto__','STICKERP','{}.constructor(\x22return\x20this\x22)(\x20)','𝚇\x20𝙼𝙴𝙳𝙸𝙰','buttonsMessage','𝙲𝙷𝙰𝙽𝙶𝙴\x20𝙼𝙾𝙳𝙴\x20𝙾𝙵\x20𝙰𝚄𝚃𝙾\x20𝙱𝙶𝙼','key','USE\x20THIS\x20CMND\x20.austick\x20off','ON\x20THERIKICK','\x0a\x20```XMEDIA\x20COMMANDS\x20ARE\x20👇```\x20\x0a\x0a\x20\x20\x20\x20​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\x0a\x0a💻Usage:\x20*.mp4enhance*\x0aℹ️Desc:Enhance\x20video’s\x20quality.\x0a\x0a💻Usage:\x20*.interp*\x0aℹ️Desc:Increases\x20the\x20FPS\x20of\x20the\x20video.\x0a\x0a💻Usage:\x20*.mp4slowmo*\x0aℹ️Desc:Applies\x20true-slowmo\x20to\x20non-slow\x20motion\x20videos.\x0a\x0a💻Usage:\x20*.x4mp4*\x0aℹ️Desc:Reduce\x20video’s\x20quality\x20by\x2075%.\x0a\x0a💻Usage:\x20*.x2mp4*\x0aℹ️Desc:\x20Reduce\x20video’s\x20quality\x20by\x2050%.\x0a\x0a💻Usage:\x20*.gif*\x0aℹ️Desc:Converts\x20video\x20to\x20gif.\x0a\x0a💻Usage:\x20*.agif*\x0aℹ️Desc:Converts\x20video\x20to\x20voiced\x20gif.\x0a\x0a💻Usage:\x20*.mp4blur*\x0aℹ️Desc:\x20Blurs\x20the\x20background\x20of\x20the\x20video.\x0a\x0a💻Usage:\x20*.mp4stab*\x0aℹ️Desc:\x20Decreases\x20the\x20vibration\x20of\x20the\x20video.\x0a\x0a💻Usage:\x20*.mp4rainbow*\x0aℹ️Desc:\x20Applies\x20a\x20rainbow\x20effect\x20to\x20video.\x0a\x0a💻Usage:\x20*.mp4color*\x0aℹ️Desc:Makes\x20the\x20colors\x20of\x20the\x20video\x20more\x20vivid\x20and\x20beautiful.\x0a\x0a💻Usage:\x20*.mp4art*\x0aℹ️Desc:Applies\x20a\x20art\x20effect\x20to\x20the\x20video.\x0a\x0a💻Usage:\x20*.mp4negative*\x0aℹ️Desc:Applies\x20a\x20negative\x20color\x20filter\x20to\x20the\x20video.\x0a\x0a💻Usage:\x20*.mp4vintage*\x0aℹ️Desc:Applies\x20a\x20nostalgic\x20effect\x20to\x20video.\x0a\x0a💻Usage:\x20*.mp4bw*\x0aℹ️Desc:\x20Applies\x20a\x20monochrome\x20effect\x20to\x20video.\x0a\x0a💻Usage:\x20*.mp4reverse*\x0aℹ️Desc:\x20Plays\x20the\x20video\x20in\x20reverse.\x0a\x0a💻Usage:\x20*.mp4edge*\x0aℹ️Desc:Applies\x20a\x20edge\x20effect\x20to\x20the\x20video.\x0a\x0a💻Usage:\x20*.mp4image*\x0aℹ️Desc:\x20Converts\x20photo\x20to\x205\x20sec\x20video.\x0a\x0a💻Usage:\x20*.spectrum*\x0aℹ️Desc:\x20Converts\x20the\x20spectrum\x20of\x20sound\x20into\x20video.\x0a\x0a💻Usage:\x20*.waves*\x0aℹ️Desc:\x20Converts\x20the\x20wave\x20range\x20of\x20sound\x20to\x20video.\x0a\x0a💻Usage:\x20*.frequency*\x0aℹ️Desc:\x20Converts\x20the\x20frequency\x20range\x20of\x20sound\x20to\x20video.\x0a\x0a💻Usage:\x20*.avec*\x0aℹ️Desc:\x20Converts\x20the\x20histogram\x20of\x20sound\x20to\x20video.\x0a\x0a💻Usage:\x20*.volumeaudio*\x0aℹ️Desc:\x20Converts\x20the\x20decibel\x20value\x20of\x20the\x20sound\x20into\x20video.\x0a\x0a💻Usage:\x20*.cqtaudio*\x0aℹ️Desc:\x20Converts\x20the\x20CQT\x20value\x20of\x20audio\x20to\x20video.\x0a\x0a💻Usage:\x20*.mp3eq*\x0aℹ️Desc:\x20Adjusts\x20the\x20sound\x20to\x20a\x20crystal\x20clear\x20level.\x0a\x0a💻Usage:\x20*.mp3crusher*\x0aℹ️Desc:Distorts\x20the\x20sound,\x20makes\x20ridiculous.\x0a\x0a💻Usage:\x20*.mp3reverse*\x0aℹ️Desc:Plays\x20the\x20sound\x20in\x20reverse.\x0a\x0a💻Usage:\x20*.mp3pitch*\x0aℹ️Desc:Makes\x20the\x20sound\x20thinner\x20and\x20faster.\x0a\x0a💻Usage\x20*.mp3low*\x0aℹ️Desc:Makes\x20the\x20sound\x20deep\x20and\x20slower.\x0a\x0a💻Usage:\x20*.x2mp3*\x0aℹ️Desc:\x20\x20Makes\x20the\x20sound\x20twice\x20as\x20fast.\x0a\x0a💻Usage:\x20*.mp3volume*\x0aℹ️Desc:\x20🇹🇷\x20Ses\x20seviyesini\x20fazalca\x20arttırır.\x0a🇬🇧\x20Increase\x20sound\x20level\x20so\x20much.\x0a\x0a💻Usage:\x20*.bwimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20monochrome\x20efekti\x20uygular.\x0a🇬🇧\x20Applies\x20a\x20monochrome\x20effect\x20to\x20image.\x0a\x0a💻Usage:\x20*.vintageimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20vintage\x20efekti\x20uygular.\x0a🇬🇧\x20Applies\x20a\x20vinatge\x20effect\x20to\x20video.\x0a\x0a💻Usage:\x20*.edgeimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20edge\x20efekti\x20uygular.\x0a🇬🇧\x20Applies\x20a\x20edge\x20effect\x20to\x20the\x20photo.\x0a\x0a💻Usage:\x20*.enhanceimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafı\x20daha\x20net\x20hale\x20getirir.\x0a🇬🇧\x20Makes\x20the\x20photo\x20clearer.\x0a\x0a💻Usage:\x20*.blurimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafın\x20arka\x20planını\x20bulanıklaştırır.\x0a🇬🇧\x20Blurs\x20the\x20background\x20of\x20the\x20photo.\x0a\x0a💻Usage:\x20*.grenimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20gren\x20efekti\x20uygular.\x0a🇬🇧\x20Applies\x20grain\x20effect\x20to\x20the\x20photo.\x0a\x0a💻Usage:\x20*.negativeimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20negatif\x20renk\x20filtresi\x20uygular.\x0a🇬🇧\x20Applies\x20a\x20negative\x20color\x20filter\x20to\x20the\x20photo.\x0a\x0a💻Usage:\x20*.rainbowimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20gökkuşağı\x20efekti\x20uygular.\x0a🇬🇧\x20Applies\x20rainbow\x20effect\x20to\x20the\x20photo.\x0a\x0a💻Usage:\x20*.colorimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafın\x20renklerini\x20daha\x20canlı\x20ve\x20çekici\x20yapar.\x0a🇬🇧\x20It\x20makes\x20the\x20colors\x20of\x20the\x20photo\x20more\x20vivid\x20and\x20attractive.\x0a\x0a💻Usage:\x20*.artimage*\x0aℹ️Desc:\x20🇹🇷\x20Fotoğrafa\x20çizim\x20efekti\x20uygular.\x0a🇬🇧\x20Applies\x20a\x20art\x20effect\x20to\x20the\x20photo.','search','catch','apply','OFF\x20ZARA_AI','\x20```','𝙲𝙷𝙽𝙶\x20𝚃𝙷𝙴𝚁𝙸\x20𝙱𝙻𝙾𝙲𝙺\x20𝙼𝙾𝙳𝙴','commands','get','ON\x20PMBLOCK','ANTİ_LİNK',':\x20```','717KZKGHL','12EpJGTQ','148ulZqXQ','warn','Owner','```\x20\x0a\x0a','*⌨︎','𝙲𝙷𝙰𝙽𝙶𝙴\x20𝙰𝙽𝚃𝙸𝙻𝙸𝙽𝙺\x20𝙼𝙾𝙳𝙴','error','```CMNDS\x20OF```\x20','private','status@broadcast','OFF\x20ANTILINK','9077750jvfNxC','PHONE','USE\x20THIS\x20CMND\x20.austick\x20on','buttonsResponseMessage','PM_BLOCK','```\x0a','THERI_KICK_PM','1312360QusFZE','157565qyareG','𝙰𝙻𝙻\x20𝙲𝙼𝙽𝙳𝚂','public','return\x20(function()\x20','BOTPLK','.restart','DESC','usage','USE\x20THIS\x20CMND\x20.bgm\x20off','fromMe','EXAMPLE','false','HANDLERS','OFF\x20THERIKICK','then','REMOVE2','ok\x20bye\x20🙂','selectedButtonId','\x0a\x0a\x20​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\x20\x0a','ANTİLİNK','♲︎︎︎\x20','constructor','```PERFECT\x20OKEY\x20🙂```','END:VCARD'];_0x40ec=function(){return _0x472a77;};return _0x40ec();}(function(_0x2f1e9e,_0x497e96){const _0x3bfaaf=_0x5c56,_0x3bc2a8=_0x2f1e9e();while(!![]){try{const _0x2bce52=parseInt(_0x3bfaaf(0xfa))/0x1+-parseInt(_0x3bfaaf(0xe8))/0x2*(-parseInt(_0x3bfaaf(0xa5))/0x3)+-parseInt(_0x3bfaaf(0xa7))/0x4*(-parseInt(_0x3bfaaf(0xba))/0x5)+parseInt(_0x3bfaaf(0xa6))/0x6*(-parseInt(_0x3bfaaf(0x8c))/0x7)+parseInt(_0x3bfaaf(0xf6))/0x8*(parseInt(_0x3bfaaf(0xf2))/0x9)+-parseInt(_0x3bfaaf(0xb9))/0xa+-parseInt(_0x3bfaaf(0xb2))/0xb;if(_0x2bce52===_0x497e96)break;else _0x3bc2a8['push'](_0x3bc2a8['shift']());}catch(_0x101e02){_0x3bc2a8['push'](_0x3bc2a8['shift']());}}}(_0x40ec,0xbe548));const _0x4d7e06=(function(){let _0x2ea9be=!![];return function(_0x16632f,_0x23536d){const _0x9534da=_0x2ea9be?function(){const _0x48bfa8=_0x5c56;if(_0x23536d){const _0x29ce50=_0x23536d[_0x48bfa8(0x9c)](_0x16632f,arguments);return _0x23536d=null,_0x29ce50;}}:function(){};return _0x2ea9be=![],_0x9534da;};}()),_0x4428bf=_0x4d7e06(this,function(){const _0x36c1c9=_0x5c56;return _0x4428bf[_0x36c1c9(0xdc)]()[_0x36c1c9(0x9a)](_0x36c1c9(0xe5))['toString']()[_0x36c1c9(0xcf)](_0x4428bf)[_0x36c1c9(0x9a)](_0x36c1c9(0xe5));});_0x4428bf();const _0x15eb14=(function(){let _0x4bd8a8=!![];return function(_0x6a9508,_0x6fd5c1){const _0x49ca6d=_0x4bd8a8?function(){const _0x59e8d9=_0x5c56;if(_0x6fd5c1){const _0x4222d1=_0x6fd5c1[_0x59e8d9(0x9c)](_0x6a9508,arguments);return _0x6fd5c1=null,_0x4222d1;}}:function(){};return _0x4bd8a8=![],_0x49ca6d;};}()),_0x4cdd79=_0x15eb14(this,function(){const _0x56ea0c=_0x5c56,_0x10153b=function(){const _0x442e07=_0x5c56;let _0x30f194;try{_0x30f194=Function(_0x442e07(0xbd)+_0x442e07(0x92)+');')();}catch(_0x34dc13){_0x30f194=window;}return _0x30f194;},_0xab784e=_0x10153b(),_0x40972=_0xab784e[_0x56ea0c(0xf7)]=_0xab784e[_0x56ea0c(0xf7)]||{},_0x531b24=[_0x56ea0c(0x84),_0x56ea0c(0xa8),'info',_0x56ea0c(0xad),_0x56ea0c(0x87),'table','trace'];for(let _0x4391bf=0x0;_0x4391bf<_0x531b24[_0x56ea0c(0x8d)];_0x4391bf++){const _0x19d063=_0x15eb14[_0x56ea0c(0xcf)][_0x56ea0c(0x7d)][_0x56ea0c(0xf3)](_0x15eb14),_0x5c5664=_0x531b24[_0x4391bf],_0x12c99b=_0x40972[_0x5c5664]||_0x19d063;_0x19d063[_0x56ea0c(0x90)]=_0x15eb14['bind'](_0x15eb14),_0x19d063[_0x56ea0c(0xdc)]=_0x12c99b[_0x56ea0c(0xdc)]['bind'](_0x12c99b),_0x40972[_0x5c5664]=_0x19d063;}});_0x4cdd79();const type=Object[_0x28eb32(0x75)](msg[_0x28eb32(0x79)])[0x0],Code=_0x28eb32(0x83),lpack=_0x28eb32(0xf9),owt='\x0a\x20```\x20BOT\x20OWNER\x20COMMANDS\x20ARE\x20👇```\x20\x0a\x0a\x20\x20\x20\x20​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​​\x0a\x0a💠\x20Command:\x20!install\x0a🧩\x20Description:\x20Install\x20external\x20plugins.\x0a\x0a💠\x20Command:\x20!plugin\x0a🧩\x20Description:\x20Shows\x20the\x20plugins\x20you\x20have\x20installed.\x0a\x0a💠\x20Command:\x20!remove\x0a🧩\x20Description:\x20Removes\x20the\x20plugin.\x0a\x0a💠\x20Command:\x20!ban\x0a🧩\x20Description:\x20Ban\x20someone\x20in\x20the\x20group.\x20Reply\x20to\x20message\x20or\x20tag\x20a\x20person\x20to\x20use\x20command.\x0a\x0a💠\x20Command:\x20!add\x0a🧩\x20Description:\x20Adds\x20someone\x20to\x20the\x20group.\x0a\x0a💠\x20Command:\x20!promote\x0a🧩\x20Description:\x20Makes\x20any\x20person\x20an\x20admin.\x0a\x0a💠\x20Command:\x20!demote\x0a🧩\x20Description:\x20Takes\x20the\x20authority\x20of\x20any\x20admin.\x0a\x0a💠\x20Command:\x20!mute\x0a🧩\x20Description:\x20Mute\x20the\x20group\x20chat.\x20Only\x20the\x20admins\x20can\x20send\x20a\x20message.\x0a\x0a💠\x20Command:\x20!unmute\x0a🧩\x20Description:\x20Unmute\x20the\x20group\x20chat.\x20Anyone\x20can\x20send\x20a\x20message.\x0a\x0a💠\x20Command:\x20!invite\x0a🧩\x20Description:\x20Provides\x20the\x20groups\x20invitation\x20link.\x0a\x0a💠\x20Command:\x20!afk\x0a🧩\x20Description:\x20It\x20makes\x20you\x20AFK\x20-\x20Away\x20From\x20Keyboard.\x0a\x0a💠\x20Command:\x20!del\x0a🧩\x20Description:\x20Deletes\x20The\x20Replied\x20Message\x20Send\x20By\x20The\x20Bot\x20[\x20✅\x20Official\x20External\x20Plugin\x20]\x0a\x0a💠\x20Command:\x20!justspam\x0a🧩\x20Description:\x20spam\x20the\x20sticker\x20you\x20replyed.\x0a\x0a💠\x20Command:\x20!welcome\x0a🧩\x20Description:\x20It\x20sets\x20the\x20welcome\x20message.\x20If\x20you\x20leave\x20it\x20blank\x20it\x20shows\x20the\x20welcome\x20message.\x0a\x0a💠\x20Command:\x20!goodbye\x0a🧩\x20Description:\x20Sets\x20the\x20goodbye\x20message.\x20If\x20you\x20leave\x20blank,\x20it\x20shows\x20the\x20goodbye\x20message\x0a\x0a💠\x20Command:\x20!phelp\x0a🧩\x20Description:\x20Gives\x20information\x20about\x20using\x20the\x20bot\x20from\x20the\x20Help\x20menu.\x0a\x0a💠\x20Command:\x20!degis\x0a\x0a💠\x20Command:\x20!restart\x0a🧩\x20Description:\x20Restart\x20Zara\x0a\x0a💠\x20Command:\x20!shutdown\x0a🧩\x20Description:\x20Shutdown\x20Zara\x0a\x0a💠\x20Command:\x20!dyno\x0a🧩\x20Description:\x20Check\x20heroku\x20dyno\x20usage\x0a\x0a💠\x20Command:\x20!setvar\x0a🧩\x20Description:\x20Set\x20heroku\x20config\x20var\x0a\x0a💠\x20Command:\x20!delvar\x0a🧩\x20Description:\x20Delete\x20heroku\x20config\x20var\x0a\x0a💠\x20Command:\x20!getvar\x0a🧩\x20Description:\x20Get\x20heroku\x20config\x20var\x0a\x0a💠\x20Command:\x20!leave\x0a🧩\x20Description:\x20It\x20kicks\x20you\x20from\x20the\x20group\x20you\x20are\x20using\x20it\x20in.\x0a\x0a💠\x20Command:\x20!pp\x0a🧩\x20Description:\x20Makes\x20the\x20profile\x20photo\x20what\x20photo\x20you\x20reply.\x0a\x0a💠\x20Command:\x20!block\x0a🧩\x20Description:\x20Block\x20user.\x0a\x0a💠\x20Command:\x20!unblock\x0a🧩\x20Description:\x20Unblock\x20user.\x0a\x0a💠\x20Command:\x20!jid\x0a🧩\x20Description:\x20Giving\x20users\x20JID.\x0a\x0a💠\x20Command:\x20!scam\x0a🧩\x20Description:\x20Creates\x205\x20minutes\x20of\x20fake\x20actions.\x0a\x0a💠\x20Command:\x20!spam\x5cn🧩\x20Description:\x20It\x20spam\x20until\x20you\x20stop\x20it.\x0a⌨️\x20Example:\x20.spam\x20test\x0a\x0a💠\x20Command:\x20!filtre\x0a🧩\x20Description:\x20add\x20filtre\x20in\x20chats\x0aeg:\x20.filter\x20\x22input\x22\x20\x22output\x22\x0a\x0a💠\x20Command:\x20!tagall\x0a🧩\x20Description:\x20Tags\x20everyone\x20in\x20the\x20group.\x0a\x0a💠\x20Command:\x20!stam\x0a🧩\x20Description:\x20sends\x20the\x20replyed\x20messages\x20to\x20all\x20the\x20members\x20in\x20the\x20group\x20\x0a\x0a💠\x20Command:\x20!update\x0a🧩\x20Description:\x20Checks\x20the\x20update.\x0a\x0a💠\x20Command:\x20update\x20now\x0a🧩\x20Description:\x20It\x20makes\x20updates.',xmt=_0x28eb32(0x99),purl=await getBuffer(zara['LOGO']),verq={'key':{'fromMe':![],'participant':_0x28eb32(0xd4),...msg[_0x28eb32(0x96)][_0x28eb32(0x7e)]?{'remoteJid':_0x28eb32(0xb0)}:{}},'message':{'imageMessage':{'url':_0x28eb32(0x81),'mimetype':_0x28eb32(0xd8),'caption':Config['BOTPLK'],'fileSha256':'+Ia+Dwib70Y1CWRMAP9QLJKjIJt54fKycOfB2OEZbTU=','fileLength':'28777','height':0x438,'width':0x437,'mediaKey':_0x28eb32(0xdb),'fileEncSha256':'sR9D2RS5JSifw49HeBADguI23fWDz1aZu4faWG/CyRY=','directPath':'/v/t62.7118-24/21427642_840952686474581_572788076332761430_n.enc?oh=3f57c1ba2fcab95f2c0bb475d72720ba&oe=602F3D69','mediaKeyTimestamp':'1610993486','jpegThumbnail':purl}}},Button=type==_0x28eb32(0xb5)?msg[_0x28eb32(0x79)]['buttonsResponseMessage'][_0x28eb32(0xcb)]:'',selectedButton=type==_0x28eb32(0x74)?msg[_0x28eb32(0x79)][_0x28eb32(0x74)][_0x28eb32(0xe6)]:'';switch(Button){case _0x28eb32(0xe1):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],'```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```',MessageType['text']);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{[_0x28eb32(0xb6)]:'false'}}),await conn['sendMessage'](msg[_0x28eb32(0x96)]['remoteJid'],'```PERFECT\x20OKEY\x20🙂```',MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0xa2):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)]['remoteJid'],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku['patch'](baseURI+'/config-vars',{'body':{[_0x28eb32(0xb6)]:_0x28eb32(0xee)}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0x7c):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{[_0x28eb32(0x73)]:'false'}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0xc7):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn['sendMessage'](msg[_0x28eb32(0x96)]['remoteJid'],'```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```',MessageType[_0x28eb32(0xd5)]);await heroku['patch'](baseURI+'/config-vars',{'body':{[_0x28eb32(0xb8)]:_0x28eb32(0xc5)}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0x9d):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku['patch'](baseURI+_0x28eb32(0xec),{'body':{[_0x28eb32(0x8f)]:_0x28eb32(0xc5)}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0xb1):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],'```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```',MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{[_0x28eb32(0xa3)]:_0x28eb32(0xc5)}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case'ON\x20THERIBLOCK':if(!msg['key'][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg['key']['remoteJid'],_0x28eb32(0xe4),MessageType['text']);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{[_0x28eb32(0x73)]:'true'}}),await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType['text']);return;case _0x28eb32(0x98):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{['THERI_KICK_PM']:_0x28eb32(0xee)}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0x8b):if(!msg[_0x28eb32(0x96)]['fromMe'])return await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{['ANTİLİNK']:_0x28eb32(0xee)}}),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0xeb):if(!msg['key'][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xe0)](baseURI+'/config-vars',{'body':{[_0x28eb32(0x8f)]:'true'}}),await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType['text']);return;case _0x28eb32(0xaf):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku['patch'](baseURI+_0x28eb32(0xec),{'body':{['WORK_TYPE']:_0x28eb32(0xaf)}}),await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case'public':if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xe0)](baseURI+_0x28eb32(0xec),{'body':{['WORK_TYPE']:_0x28eb32(0xbc)}}),await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xd0),MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0xe7):if(!msg[_0x28eb32(0x96)]['fromMe'])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);await heroku[_0x28eb32(0xa1)](baseURI+'/formation')[_0x28eb32(0xc8)](async _0x495b5b=>{const _0x417ae6=_0x28eb32;forID=_0x495b5b[0x0]['id'],await conn[_0x417ae6(0x7f)](msg[_0x417ae6(0x96)][_0x417ae6(0x7e)],_0x417ae6(0xca),MessageType[_0x417ae6(0xd5)]),await heroku['patch'](baseURI+'/formation/'+forID,{'body':{'quantity':0x0}});})[_0x28eb32(0x9b)](async _0x107c94=>{const _0x583108=_0x28eb32;await conn['sendMessage'](msg['key']['remoteJid'],_0x107c94[_0x583108(0x79)],MessageType[_0x583108(0xd5)]);});return;case _0x28eb32(0xbf):await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],'restarting🌚',MessageType[_0x28eb32(0xd5)]),console[_0x28eb32(0x84)](baseURI),await heroku['delete'](baseURI+'/dynos')['catch'](async _0x33e087=>{const _0x126274=_0x28eb32;await conn[_0x126274(0x7f)](msg[_0x126274(0x96)]['remoteJid'],_0x33e087[_0x126274(0x79)],MessageType[_0x126274(0xd5)]);});return;case'.number':const vcont=_0x28eb32(0x7a)+_0x28eb32(0xe2)+_0x28eb32(0x77)+config['PLK']+'\x0a'+_0x28eb32(0xd7)+zara[_0x28eb32(0xc0)]+';\x0a'+_0x28eb32(0xde)+zara[_0x28eb32(0xb3)]+':'+zara['PHONE']+'\x20\x0a'+_0x28eb32(0xd1);await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],{'displayname':_0x28eb32(0xa9),'vcard':vcont},MessageType['contact'],{'quoted':verq});return;case _0x28eb32(0x78):await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0x8e),MessageType[_0x28eb32(0xd5)]);return;}function _0x5c56(_0x4966a9,_0x1b576b){const _0x8d6684=_0x40ec();return _0x5c56=function(_0x4cdd79,_0x15eb14){_0x4cdd79=_0x4cdd79-0x73;let _0x44a12b=_0x8d6684[_0x4cdd79];return _0x44a12b;},_0x5c56(_0x4966a9,_0x1b576b);}switch(selectedButton){case _0x28eb32(0xd2):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);var pbb='';if(zara['PM_BLOCK']==_0x28eb32(0xee))pbb='OFF\x20PMBLOCK';if(zara[_0x28eb32(0xb6)]==_0x28eb32(0xc5))pbb='ON\x20PMBLOCK';const pbuttons=[{'buttonId':pbb,'buttonText':{'displayText':_0x28eb32(0xf8)},'type':0x1}],pbuttonMessage={'contentText':_0x28eb32(0x88)+pbb+'*','footerText':zara[_0x28eb32(0xc0)],'buttons':pbuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],pbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case _0x28eb32(0x9f):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType['text']);var tbb='';if(zara[_0x28eb32(0x73)]==_0x28eb32(0xee))tbb=_0x28eb32(0x7c);if(zara[_0x28eb32(0x73)]==_0x28eb32(0xc5))tbb=_0x28eb32(0xf5);const tbuttons=[{'buttonId':tbb,'buttonText':{'displayText':_0x28eb32(0xf8)},'type':0x1}],tbuttonMessage={'contentText':_0x28eb32(0x88)+tbb+'*','footerText':zara[_0x28eb32(0xc0)],'buttons':tbuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],tbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case'𝙲𝙷𝙽𝙶\x20𝚃𝙷𝙴𝚁𝙸\x20𝙺𝙸𝙲𝙺\x20𝙼𝙾𝙳𝙴':if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],'```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```',MessageType[_0x28eb32(0xd5)]);var tkb='';if(zara[_0x28eb32(0xc9)]==_0x28eb32(0xee))tkb=_0x28eb32(0xc7);if(zara['REMOVE2']==_0x28eb32(0xc5))tkb=_0x28eb32(0x98);const tkbuttons=[{'buttonId':tkb,'buttonText':{'displayText':_0x28eb32(0xf8)},'type':0x1}],tkbuttonMessage={'contentText':_0x28eb32(0x88)+tkb+'*','footerText':zara[_0x28eb32(0xc0)],'buttons':tkbuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],tkbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case'𝙲𝙷𝙰𝙽𝙶𝙴\x20𝙼𝙾𝙳𝙴\x20𝙾𝙵\x20𝙰𝚄𝚃𝙾\x20𝚂𝚃𝙸𝙲𝙺𝙴𝚁':if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn['sendMessage'](msg['key'][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);var sbb='';if(config['STICKERP']==_0x28eb32(0xee))sbb=_0x28eb32(0x97);if(config[_0x28eb32(0x91)]==_0x28eb32(0xc5))sbb=_0x28eb32(0xb4);await conn['sendMessage'](msg[_0x28eb32(0x96)]['remoteJid'],sbb,MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0x95):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn['sendMessage'](msg['key'][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);var bb='';if(config[_0x28eb32(0x8a)]==_0x28eb32(0xee))bb=_0x28eb32(0xc2);if(config[_0x28eb32(0x8a)]==_0x28eb32(0xc5))bb=_0x28eb32(0xe9);await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],bb,MessageType[_0x28eb32(0xd5)]);return;case _0x28eb32(0xef):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],'```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```',MessageType[_0x28eb32(0xd5)]);var zb='';if(config[_0x28eb32(0x8f)]==_0x28eb32(0xee))zb=_0x28eb32(0x9d);if(config[_0x28eb32(0x8f)]==_0x28eb32(0xc5))zb=_0x28eb32(0xeb);const zbuttons=[{'buttonId':zb,'buttonText':{'displayText':_0x28eb32(0xf8)},'type':0x1}],zbuttonMessage={'contentText':_0x28eb32(0x88)+zb+'*','footerText':zara[_0x28eb32(0xc0)],'buttons':zbuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)]['remoteJid'],zbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case _0x28eb32(0xac):if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType[_0x28eb32(0xd5)]);var ab='';if(config[_0x28eb32(0xcd)]==_0x28eb32(0xee))ab='OFF\x20ANTILINK';if(config[_0x28eb32(0xcd)]==_0x28eb32(0xc5))ab=_0x28eb32(0x8b);const abuttons=[{'buttonId':ab,'buttonText':{'displayText':_0x28eb32(0xf8)},'type':0x1}],abuttonMessage={'contentText':'\x0a𝙳𝙾\x20𝚈𝙾𝚄\x20𝚁𝙴𝙰𝙻𝚈\x20𝚆𝙰𝙽𝚃\x20𝚃𝙾\x20*'+ab+'*','footerText':zara[_0x28eb32(0xc0)],'buttons':abuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],abuttonMessage,MessageType[_0x28eb32(0x94)]);return;case'𝙲𝙷𝙰𝙽𝙶𝙴\x20𝚆𝙾𝚁𝙺𝚃𝚈𝙿𝙴':if(!msg['key']['fromMe'])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType['text']);var wb='';if(config[_0x28eb32(0xe3)]=='public')wb=_0x28eb32(0xaf);if(config['WORKTYPE']=='private')wb=_0x28eb32(0xbc);const wbuttons=[{'buttonId':wb,'buttonText':{'displayText':'𝚈𝙴𝚂'},'type':0x1}],wbuttonMessage={'contentText':_0x28eb32(0x85)+wb+'*','footerText':zara['DESC'],'buttons':wbuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],wbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case _0x28eb32(0xd9):if(!msg['key'][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],'```ONLY\x20WORK\x20AT\x20BOT\x20NUMB\x20VRO🌚```',MessageType[_0x28eb32(0xd5)]);const rbuttons=[{'buttonId':_0x28eb32(0xbf),'buttonText':{'displayText':'𝚈𝙴𝚂'},'type':0x1}],rbuttonMessage={'contentText':'\x0a𝙳𝙾\x20𝚈𝙾𝚄\x20𝚁𝙴𝙰𝙻𝚈\x20𝚆𝙰𝙽𝚃\x20𝚃𝙾\x20𝚁𝙴𝚂𝚃𝙰𝚁𝚃\x20𝚄𝚁\x20𝙱𝙾𝚃','footerText':zara[_0x28eb32(0xc0)],'buttons':rbuttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],rbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case'𝚂𝙷𝚄𝚃\x20𝙳𝙾𝚆𝙽':if(!msg[_0x28eb32(0x96)][_0x28eb32(0xc3)])return await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xe4),MessageType['text']);const sbuttons=[{'buttonId':_0x28eb32(0xe7),'buttonText':{'displayText':_0x28eb32(0xf8)},'type':0x1}],sbuttonMessage={'contentText':_0x28eb32(0x7b),'footerText':zara[_0x28eb32(0xc0)],'buttons':buttons,'headerType':0x1};await conn[_0x28eb32(0x7f)](msg['key'][_0x28eb32(0x7e)],sbuttonMessage,MessageType[_0x28eb32(0x94)]);return;case _0x28eb32(0xf1):await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],_0x28eb32(0xf0),MessageType['text']),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],Code,MessageType['text'],{'quoted':verq});return;case'𝙻𝙾𝙶𝙾\x20𝙿𝙰𝙲𝙺':await conn[_0x28eb32(0x7f)](msg['key']['remoteJid'],_0x28eb32(0xf0),MessageType[_0x28eb32(0xd5)]),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)]['remoteJid'],lpack,MessageType[_0x28eb32(0xd5)],{'quoted':verq});return;case _0x28eb32(0xd3):await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)]['remoteJid'],_0x28eb32(0xf0),MessageType['text']),await conn['sendMessage'](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],owt,MessageType[_0x28eb32(0xd5)],{'quoted':verq});return;case _0x28eb32(0x93):await conn['sendMessage'](msg[_0x28eb32(0x96)]['remoteJid'],_0x28eb32(0xf0),MessageType[_0x28eb32(0xd5)]),await conn[_0x28eb32(0x7f)](msg[_0x28eb32(0x96)][_0x28eb32(0x7e)],xmt,MessageType[_0x28eb32(0xd5)],{'quoted':verq});return;case _0x28eb32(0xbb):await conn['sendMessage'](msg['key']['remoteJid'],_0x28eb32(0xf0),MessageType[_0x28eb32(0xd5)]);var CMD_HELP='';const Rashi=require(_0x28eb32(0x80));Rashi[_0x28eb32(0xa0)][_0x28eb32(0xea)](async _0x99400a=>{const _0x4f0371=_0x28eb32;if(_0x99400a[_0x4f0371(0x82)]||_0x99400a[_0x4f0371(0x89)]===undefined)return;try{var _0x5bd170=_0x99400a[_0x4f0371(0x89)][_0x4f0371(0xdc)]()[_0x4f0371(0x76)](/(\W*)([A-Za-zğüşıiöç1234567890 ]*)/),_0x22c69d=_0x99400a[_0x4f0371(0x89)]['toString']()[_0x4f0371(0x76)](/(\W*)([A-Za-züşiğ öç1234567890]*)/)[0x2];}catch{var _0x5bd170=[_0x99400a[_0x4f0371(0x89)]];}var _0xc42aef='';/\[(\W*)\]/[_0x4f0371(0xdd)](Config[_0x4f0371(0xc6)])?_0xc42aef=Config['HANDLERS'][_0x4f0371(0x76)](/\[(\W*)\]/)[0x1][0x0]:_0xc42aef='.',_0x99400a['desc']==''&&!_0x99400a[_0x4f0371(0xc1)]==''&&_0x99400a['warn']==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a['pattern'])+'\x0a'+_0x4f0371(0xce)+Lang['EXAMPLE']+_0x4f0371(0xa4)+_0x99400a[_0x4f0371(0xc1)]+_0x4f0371(0xda)),!_0x99400a['desc']==''&&_0x99400a[_0x4f0371(0xc1)]==''&&_0x99400a[_0x4f0371(0xa8)]==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a['pattern'])+'\x0a'+'◩\x20'+_0x4f0371(0x9e)+_0x99400a[_0x4f0371(0xd6)]+_0x4f0371(0xaa)),_0x99400a[_0x4f0371(0xd6)]==''&&_0x99400a[_0x4f0371(0xc1)]==''&&!_0x99400a[_0x4f0371(0xa8)]==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a[_0x4f0371(0x89)])+'\x0a'+'◩\x20'+_0x4f0371(0x9e)+_0x99400a[_0x4f0371(0xa8)]+'```\x0a\x0a'),!_0x99400a[_0x4f0371(0xd6)]==''&&!_0x99400a['usage']==''&&_0x99400a[_0x4f0371(0xa8)]==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a['pattern'])+'\x0a'+'◩\x20'+_0x4f0371(0x9e)+_0x99400a[_0x4f0371(0xd6)]+_0x4f0371(0xdf)+_0x4f0371(0xab)+Lang[_0x4f0371(0xc4)]+_0x4f0371(0xed)+_0x99400a[_0x4f0371(0xc1)]+_0x4f0371(0xda)),!_0x99400a[_0x4f0371(0xd6)]==''&&_0x99400a[_0x4f0371(0xc1)]==''&&!_0x99400a[_0x4f0371(0xa8)]==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a['pattern'])+'\x0a'+'◩\x20'+_0x4f0371(0x9e)+_0x99400a[_0x4f0371(0xd6)]+_0x4f0371(0xdf)+'*⚠️\x20'+Lang[_0x4f0371(0x86)]+_0x4f0371(0xed)+_0x99400a[_0x4f0371(0xa8)]+_0x4f0371(0xda)),_0x99400a[_0x4f0371(0xd6)]==''&&!_0x99400a[_0x4f0371(0xc1)]==''&&!_0x99400a['warn']==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a['pattern'])+'\x0a'+_0x4f0371(0xce)+_0x4f0371(0x9e)+_0x99400a[_0x4f0371(0xc1)]+_0x4f0371(0xb7)+_0x4f0371(0xf4)+Lang['WARN']+_0x4f0371(0xed)+_0x99400a[_0x4f0371(0xa8)]+'```\x0a\x0a'),_0x99400a['desc']==''&&_0x99400a[_0x4f0371(0xc1)]==''&&_0x99400a[_0x4f0371(0xa8)]==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a['pattern'])+'\x0a\x0a'),!_0x99400a[_0x4f0371(0xd6)]==''&&!_0x99400a['usage']==''&&!_0x99400a[_0x4f0371(0xa8)]==''&&(CMD_HELP+='❑\x20'+(_0x5bd170[_0x4f0371(0x8d)]>=0x3?_0xc42aef+_0x22c69d:_0x99400a[_0x4f0371(0x89)])+'\x0a'+'◩\x20'+_0x4f0371(0x9e)+_0x99400a['desc']+_0x4f0371(0xdf)+_0x4f0371(0xab)+Lang[_0x4f0371(0xc4)]+_0x4f0371(0xed)+_0x99400a[_0x4f0371(0xc1)]+_0x4f0371(0xb7)+_0x4f0371(0xf4)+Lang[_0x4f0371(0x86)]+_0x4f0371(0xed)+_0x99400a[_0x4f0371(0xa8)]+_0x4f0371(0xda));}),await conn['sendMessage'](msg[_0x28eb32(0x96)]['remoteJid'],_0x28eb32(0xae)+Config[_0x28eb32(0xbe)]+_0x28eb32(0xcc)+CMD_HELP,MessageType['text'],{'quoted':verq});return;}

//yt button respons

(function(_0x18050f,_0x120b94){function _0x5636ec(_0x3cde18,_0x135b18,_0x32dae5,_0x45f04e){return _0x505f(_0x3cde18-0x17f,_0x32dae5);}const _0x5bef59=_0x18050f();function _0x489ca6(_0x88016,_0x5c28f5,_0xbad43d,_0x192ee7){return _0x505f(_0x88016-0x197,_0x5c28f5);}while(!![]){try{const _0x3d53ec=parseInt(_0x489ca6(0x252,0x26a,0x253,0x249))/(-0x7*0x2c8+-0x5d0+-0x1*-0x1949)*(parseInt(_0x5636ec(0x24b,0x25a,0x25d,0x25f))/(-0x268d+0x3*0x376+0x1*0x1c2d))+parseInt(_0x489ca6(0x25a,0x23e,0x251,0x259))/(0x24ad+-0xa3*0x1a+-0x21*0x9c)+parseInt(_0x5636ec(0x248,0x243,0x244,0x23b))/(-0x12a0+0x102f*0x1+0x275)*(-parseInt(_0x489ca6(0x249,0x26d,0x26d,0x250))/(-0xc3e+-0x106*-0xd+-0x10b))+parseInt(_0x5636ec(0x240,0x261,0x22e,0x231))/(-0x1c2*0x7+-0x30*-0x6b+-0x12*0x6e)*(parseInt(_0x489ca6(0x28c,0x2a6,0x271,0x2ae))/(0x6*-0x4f7+0x1287+0xb4a))+-parseInt(_0x489ca6(0x259,0x27b,0x274,0x25f))/(0x1*-0x26bd+-0x1a85+0x414a)*(-parseInt(_0x5636ec(0x260,0x27f,0x248,0x25f))/(0x2709+0x8c+-0x278c))+parseInt(_0x489ca6(0x27c,0x270,0x290,0x29f))/(-0x284+0x255d+0x22cf*-0x1)+-parseInt(_0x489ca6(0x256,0x252,0x24a,0x262))/(-0x2bd+0x1b67*-0x1+0x1e2f);if(_0x3d53ec===_0x120b94)break;else _0x5bef59['push'](_0x5bef59['shift']());}catch(_0x154392){_0x5bef59['push'](_0x5bef59['shift']());}}}(_0x4b89,-0x15993a*0x1+-0x1*-0x118e68+0x11083e));function _0x505f(_0xafc059,_0x5dd4ca){const _0x4b892e=_0x4b89();return _0x505f=function(_0x505ffb,_0x1f40ce){_0x505ffb=_0x505ffb-(-0x1*-0x1388+-0x52d+0x48f*-0x3);let _0x2b65aa=_0x4b892e[_0x505ffb];return _0x2b65aa;},_0x505f(_0xafc059,_0x5dd4ca);}function _0x4b89(){const _0x2ad787=['bind','apply','Akgeo','XfPaV','QeEmr','myIBP','(((.+)+)+)','BGuFE','PhhtR','ponseMessa','{}.constru','pikey=Raas','```downloa','message','e/foryt.js','ding...```','hii','9nbdMKa','parse','sendMessag','nzapi.xyz/','1028780qnYuQj','ZpZIg','MLvKS','warn','rn\x20this\x22)(','HWaMe','url','MratD','tdPMk','return\x20(fu','error','remoteJid','uKZZr','EHejO','log','https://ze','14fYodSI','ctor(\x22retu','XUtNX','key','table','32815UXBTVE','text','api/downlo','toString','hehe','length','qSRHE','console','DUUZJ','1ciEmPg','search','NWDaA','ytv','18187499KaAqcN','constructo','4252398BorLOt','4797008zgqBFx','1115649ZDUVyg','caption','&index=2&a','NldUF','mabtP','__proto__','12htatrX','prototype','replace','65106xlyAxt','buttonsRes','nction()\x20','video'];_0x4b89=function(){return _0x2ad787;};return _0x4b89();}const _0x5dd4ca=(function(){const _0x4b1d1f={};_0x4b1d1f['HWaMe']=function(_0x4540ac,_0x3ef581){return _0x4540ac!==_0x3ef581;},_0x4b1d1f[_0xf101c(0x2ba,0x2d4,0x2c7,0x2d8)]='ISpAC',_0x4b1d1f[_0x5d8e3a(0x42e,0x412,0x433,0x452)]=_0x5d8e3a(0x462,0x476,0x468,0x470);function _0x5d8e3a(_0x1c0677,_0x20c8c9,_0x53e72a,_0x292443){return _0x505f(_0x53e72a-0x37b,_0x20c8c9);}const _0x13123f=_0x4b1d1f;function _0xf101c(_0x4df0f2,_0x38c6a7,_0x584b99,_0x4344d3){return _0x505f(_0x38c6a7-0x1e2,_0x584b99);}let _0x2fee47=!![];return function(_0x2796cf,_0x689cbb){function _0x25a9b1(_0x272c5b,_0x43065f,_0x2ae872,_0x1b7cd4){return _0x5d8e3a(_0x272c5b-0x1c3,_0x1b7cd4,_0x43065f- -0x683,_0x1b7cd4-0x185);}const _0x73f23d={'eXzlq':function(_0x2ec272,_0x414e1c){function _0x531869(_0x368029,_0x3afb5a,_0x1c1e48,_0x19d7df){return _0x505f(_0x3afb5a- -0x301,_0x1c1e48);}return _0x13123f[_0x531869(-0x237,-0x217,-0x1fd,-0x1fb)](_0x2ec272,_0x414e1c);},'myIBP':_0x13123f[_0x25a9b1(-0x22d,-0x216,-0x22e,-0x22d)],'uKZZr':_0x13123f[_0x40d5bb(-0x2a4,-0x2a2,-0x2bb,-0x2aa)]},_0xbddb66=_0x2fee47?function(){function _0x46ec1f(_0x396732,_0x47c588,_0xe23d82,_0x5d6329){return _0x25a9b1(_0x396732-0x34,_0x47c588-0x25e,_0xe23d82-0x9,_0x5d6329);}function _0xfb6252(_0x4e7932,_0xa34047,_0x2c6667,_0xc29957){return _0x40d5bb(_0x4e7932-0x19b,_0x4e7932-0x74,_0x2c6667-0xf0,_0x2c6667);}if(_0x73f23d['eXzlq'](_0x73f23d[_0x46ec1f(0xe,0x2b,0x38,0x37)],_0x73f23d[_0x46ec1f(0x57,0x47,0x31,0x58)])){if(_0x689cbb){const _0x3be888=_0x689cbb[_0x46ec1f(0x26,0x27,0x3a,0x33)](_0x2796cf,arguments);return _0x689cbb=null,_0x3be888;}}else{const _0x2ede4e=_0xa5c7e8[_0xfb6252(-0x226,-0x209,-0x220,-0x202)+'r'][_0x46ec1f(0x29,0x20,0x2b,0xe)][_0xfb6252(-0x216,-0x213,-0x216,-0x226)](_0x49d6e4),_0x2c2bea=_0x23084c[_0x5c1142],_0x361a84=_0x3949d3[_0x2c2bea]||_0x2ede4e;_0x2ede4e['__proto__']=_0x413a1a['bind'](_0x456a78),_0x2ede4e[_0xfb6252(-0x231,-0x244,-0x232,-0x220)]=_0x361a84[_0xfb6252(-0x231,-0x228,-0x233,-0x219)][_0xfb6252(-0x216,-0x1f7,-0x20f,-0x229)](_0x361a84),_0x5c2f8b[_0x2c2bea]=_0x2ede4e;}}:function(){};_0x2fee47=![];function _0x40d5bb(_0x3b6ff1,_0x565efd,_0x4c9d31,_0x32c67f){return _0xf101c(_0x3b6ff1-0x43,_0x565efd- -0x53c,_0x32c67f,_0x32c67f-0xff);}return _0xbddb66;};}());function _0x516882(_0x53e2b7,_0x307460,_0x293c7f,_0x1052ca){return _0x505f(_0x53e2b7- -0x43,_0x293c7f);}const _0xafc059=_0x5dd4ca(this,function(){function _0x4ab97d(_0x9aa828,_0x4d04a0,_0x21b97b,_0x22d9b2){return _0x505f(_0x21b97b-0xe4,_0x22d9b2);}const _0x2c7ee3={};_0x2c7ee3[_0x4ab97d(0x1bd,0x1d6,0x1d0,0x1d2)]=_0x3d9b7a(-0x29a,-0x29b,-0x2aa,-0x286)+'+$';function _0x3d9b7a(_0x150f09,_0x5d67fa,_0x35ff06,_0x418ac5){return _0x505f(_0x5d67fa- -0x371,_0x150f09);}const _0x21a018=_0x2c7ee3;return _0xafc059['toString']()[_0x3d9b7a(-0x2c1,-0x2b5,-0x2d6,-0x2a2)]('(((.+)+)+)'+'+$')[_0x4ab97d(0x1a8,0x1a4,0x199,0x185)]()[_0x4ab97d(0x183,0x1bf,0x1a4,0x1b8)+'r'](_0xafc059)[_0x3d9b7a(-0x2a9,-0x2b5,-0x2d9,-0x2d2)](_0x21a018[_0x3d9b7a(-0x2a6,-0x285,-0x29c,-0x2a9)]);});_0xafc059();const _0x131b47=(function(){const _0x5071bf={};_0x5071bf['BGuFE']=function(_0x45aa40,_0x20cc51){return _0x45aa40!==_0x20cc51;};const _0x1705ba=_0x5071bf;let _0x35e93c=!![];return function(_0x17dca9,_0x2fd689){const _0x329140={'OslmW':function(_0x1332cf,_0x2a0eca){function _0x227f7e(_0x42be5e,_0x31225f,_0x395b10,_0x4dc2fd){return _0x505f(_0x395b10-0x1ab,_0x4dc2fd);}return _0x1705ba[_0x227f7e(0x283,0x26a,0x282,0x2a5)](_0x1332cf,_0x2a0eca);},'MLvKS':'Ognge'},_0x29c754=_0x35e93c?function(){function _0x548a39(_0x1066c8,_0x76d32b,_0x3852f2,_0x335c3e){return _0x505f(_0x76d32b- -0x188,_0x1066c8);}function _0x233dfd(_0x71f9f2,_0x4580e4,_0x5d53d7,_0x4963f4){return _0x505f(_0x71f9f2- -0xae,_0x4580e4);}if(_0x2fd689){if(_0x329140['OslmW'](_0x329140[_0x233dfd(0x39,0x53,0x41,0x1a)],_0x329140[_0x233dfd(0x39,0x45,0x18,0x52)])){if(_0x2885f2){const _0xc8a97a=_0x5c4234[_0x548a39(-0xbb,-0xb7,-0xd0,-0xa7)](_0x48843d,arguments);return _0x4a57dd=null,_0xc8a97a;}}else{const _0x5534dc=_0x2fd689[_0x548a39(-0xd7,-0xb7,-0xb0,-0x9d)](_0x17dca9,arguments);return _0x2fd689=null,_0x5534dc;}}}:function(){};return _0x35e93c=![],_0x29c754;};}()),_0x2e0880=_0x131b47(this,function(){const _0x40d0e8={'DUUZJ':'(((.+)+)+)'+'+$','Akgeo':function(_0x3c657a,_0x13e3be){return _0x3c657a===_0x13e3be;},'NWDaA':_0x4b4a11(0x86,0x6b,0x7a,0x6c),'frcyN':function(_0x43667c,_0xec1a5c){return _0x43667c(_0xec1a5c);},'QeEmr':function(_0x514fa1,_0x216258){return _0x514fa1+_0x216258;},'qmTET':_0x1fb9b2(0x1ea,0x1c3,0x1fe,0x1e3)+_0x4b4a11(0x69,0x73,0x4a,0x6b)+_0x1fb9b2(0x1e9,0x1e7,0x213,0x1f2)+'\x20)','mabtP':function(_0x553c89){return _0x553c89();},'ZpZIg':_0x4b4a11(0xc9,0xcd,0xb4,0xb0),'PhhtR':_0x1fb9b2(0x213,0x1ed,0x1dd,0x1f1),'XfPaV':_0x1fb9b2(0x1fd,0x1e3,0x200,0x1f8),'ZscKX':'exception','NldUF':_0x4b4a11(0x5e,0x91,0x8c,0x6e)};function _0x4b4a11(_0x2a3717,_0x3951bd,_0x2732ef,_0x1db7d0){return _0x505f(_0x1db7d0- -0x43,_0x2732ef);}const _0x4c8804=function(){function _0x18d2f5(_0x254c01,_0x4e9e3e,_0x35653b,_0x5a7490){return _0x1fb9b2(_0x254c01,_0x4e9e3e-0x60,_0x35653b-0x195,_0x35653b- -0x11a);}let _0xfd33fa;function _0x446852(_0x2664fb,_0x590f44,_0x492c5e,_0x37336a){return _0x4b4a11(_0x2664fb-0x1e0,_0x590f44-0x146,_0x2664fb,_0x37336a- -0x233);}try{if(_0x40d0e8[_0x446852(-0x1c4,-0x1c4,-0x191,-0x1a4)](_0x40d0e8[_0x18d2f5(0x95,0x98,0xac,0xa6)],_0x40d0e8[_0x18d2f5(0x8c,0xbf,0xac,0xa1)]))_0xfd33fa=_0x40d0e8['frcyN'](Function,_0x40d0e8[_0x18d2f5(0xa7,0xad,0xc3,0xe3)](_0x40d0e8[_0x18d2f5(0xe6,0xb5,0xc3,0xb7)](_0x446852(-0x167,-0x16f,-0x171,-0x188)+_0x18d2f5(0xcf,0xd1,0xbd,0xc1),_0x40d0e8['qmTET']),');'))();else return _0x4059e4[_0x446852(-0x1c8,-0x1ce,-0x1ce,-0x1c1)]()['search'](_0x40d0e8[_0x18d2f5(0xb0,0xcb,0xa9,0xb6)])[_0x446852(-0x1b4,-0x1e5,-0x1a7,-0x1c1)]()['constructo'+'r'](_0x4380f1)[_0x18d2f5(0xc0,0x89,0xab,0xbb)](_0x40d0e8[_0x18d2f5(0x96,0x85,0xa9,0x93)]);}catch(_0x227bb2){_0xfd33fa=window;}return _0xfd33fa;},_0x32094b=_0x40d0e8[_0x1fb9b2(0x1cd,0x1c4,0x1cb,0x1d0)](_0x4c8804),_0x42e945=_0x32094b[_0x1fb9b2(0x1d6,0x1cb,0x1e0,0x1c2)]=_0x32094b['console']||{};function _0x1fb9b2(_0xae5bdc,_0x34f241,_0x2a850f,_0x50f8de){return _0x505f(_0x50f8de-0x109,_0xae5bdc);}const _0x48b2f4=[_0x40d0e8[_0x1fb9b2(0x1ee,0x1d2,0x1f9,0x1ef)],_0x40d0e8[_0x1fb9b2(0x1d4,0x1c5,0x1c4,0x1e1)],'info',_0x40d0e8[_0x4b4a11(0x9a,0x75,0x77,0x90)],_0x40d0e8['ZscKX'],_0x40d0e8[_0x1fb9b2(0x1d9,0x1e1,0x1d2,0x1cf)],'trace'];for(let _0x389737=-0x18*-0x18a+0x6e1*0x5+0x4755*-0x1;_0x389737<_0x48b2f4[_0x1fb9b2(0x1bb,0x1df,0x1b4,0x1c0)];_0x389737++){const _0x2432a7=_0x131b47[_0x4b4a11(0x79,0x97,0x93,0x7d)+'r']['prototype'][_0x4b4a11(0xae,0x9c,0x73,0x8d)](_0x131b47),_0x166554=_0x48b2f4[_0x389737],_0x54e7ef=_0x42e945[_0x166554]||_0x2432a7;_0x2432a7[_0x1fb9b2(0x1da,0x1e5,0x1bd,0x1d1)]=_0x131b47[_0x1fb9b2(0x1b9,0x1ed,0x1e3,0x1d9)](_0x131b47),_0x2432a7[_0x4b4a11(0x61,0x8d,0x68,0x72)]=_0x54e7ef[_0x1fb9b2(0x1d6,0x1c6,0x1c5,0x1be)]['bind'](_0x54e7ef),_0x42e945[_0x166554]=_0x2432a7;}});_0x2e0880();const YButton=type==_0xd69176(-0x1d0,-0x1fd,-0x1e5,-0x1e0)+_0xd69176(-0x1f4,-0x1b5,-0x1b6,-0x1d4)+'ge'?msg[_0x516882(0x9a,0x87,0xaa,0xba)]['buttonsRes'+'ponseMessa'+'ge']['selectedBu'+'ttonId']:'',vy=JSON[_0xd69176(-0x1b2,-0x1ca,-0x1c2,-0x1cb)](fs['readFileSy'+'nc']('../databas'+_0x516882(0x9b,0xb2,0x9f,0xab)+'on'));function _0xd69176(_0x3ae0df,_0x213602,_0x164716,_0x4ab2b6){return _0x505f(_0x4ab2b6- -0x2ad,_0x164716);}switch(YButton){case _0x516882(0x7b,0x7e,0x6f,0x9c):await conn[_0xd69176(-0x1d9,-0x1e9,-0x1ed,-0x1ca)+'e'](msg[_0x516882(0x6d,0x71,0x6f,0x5e)][_0xd69176(-0x1c0,-0x1b7,-0x1bf,-0x1bd)],_0x516882(0x99,0x76,0xad,0xb6)+_0xd69176(-0x1da,-0x1b1,-0x1c5,-0x1ce),MessageType[_0xd69176(-0x206,-0x1ea,-0x1e8,-0x1fa)]);const ylink=vy[_0x516882(0x88,0x92,0x89,0x92)]('[','')[_0xd69176(-0x204,-0x1c6,-0x1f7,-0x1e2)](']',''),{data}=await axios(_0x516882(0xb1,0xba,0xb4,0x98)+_0xd69176(-0x1ba,-0x1c1,-0x1e4,-0x1c9)+_0xd69176(-0x1fe,-0x1fb,-0x20a,-0x1f9)+'ader/ytmp3'+'?url='+ylink+(_0x516882(0x82,0x7c,0x7a,0x6e)+_0x516882(0x98,0x8d,0x92,0x95)+_0xd69176(-0x1c7,-0x1d0,-0x1cb,-0x1cd))),{status,result}=data,vurl=await getBuffer(''+result[_0xd69176(-0x1c7,-0x1c2,-0x1b3,-0x1c2)]),_0x5e695b={};_0x5e695b['mimetype']=Mimetype['mp4'],_0x5e695b[_0xd69176(-0x1fe,-0x1ea,-0x1f3,-0x1e9)]=_0x516882(0x73,0x7d,0x5c,0x89),await conn[_0x516882(0xa0,0x92,0xa7,0x98)+'e'](msg[_0xd69176(-0x1de,-0x1e5,-0x209,-0x1fd)]['remoteJid'],vurl,MessageType[_0xd69176(-0x1c8,-0x1c8,-0x1c4,-0x1de)],_0x5e695b);return;}

        events.commands.map(
            async (command) =>  {
                if (msg.message && msg.message.imageMessage && msg.message.imageMessage.caption) {
                    var text_msg = msg.message.imageMessage.caption;
                } else if (msg.message && msg.message.videoMessage && msg.message.videoMessage.caption) {
                    var text_msg = msg.message.videoMessage.caption;
                } else if (msg.message) {
                    var text_msg = msg.message.extendedTextMessage === null ? msg.message.conversation : msg.message.extendedTextMessage.text;
                } else {
                    var text_msg = undefined;
                }

                if ((command.on !== undefined && (command.on === 'image' || command.on === 'photo')
                    && msg.message && msg.message.imageMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg)))) || 
                    (command.pattern !== undefined && command.pattern.test(text_msg)) || 
                    (command.on !== undefined && command.on === 'text' && text_msg) ||
                    // Video
                    (command.on !== undefined && (command.on === 'video')
                    && msg.message && msg.message.videoMessage !== null && 
                    (command.pattern === undefined || (command.pattern !== undefined && 
                        command.pattern.test(text_msg))))) {

                    let sendMsg = false;
                    var chat = conn.chats.get(msg.key.remoteJid)
                        
                    if ((config.SUDO !== false && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == config.SUDO || config.SUDO.includes(',') ? config.SUDO.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == config.SUDO)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
                    
                    else if ((config.MAHN !== false && msg.key.fromMe === false && command.fromMe === true &&
                        (msg.participant && config.MAHN.includes(',') ? config.MAHN.split(',').includes(msg.participant.split('@')[0]) : msg.participant.split('@')[0] == config.MAHN || config.MAHN.includes(',') ? config.MAHN.split(',').includes(msg.key.remoteJid.split('@')[0]) : msg.key.remoteJid.split('@')[0] == config.MAHN)
                    ) || command.fromMe === msg.key.fromMe || (command.fromMe === false && !msg.key.fromMe)) {
                        if (command.onlyPinned && chat.pin === undefined) return;
                        if (!command.onlyPm === chat.jid.includes('-')) sendMsg = true;
                        else if (command.onlyGroup === chat.jid.includes('-')) sendMsg = true;
                    }
    
                    if (sendMsg) {
                        if (config.SEND_READ && command.on === undefined) {
                            await conn.chatRead(msg.key.remoteJid);
                        }
                        
                        var match = text_msg.match(command.pattern);
                        
                        if (command.on !== undefined && (command.on === 'image' || command.on === 'photo' )
                        && msg.message.imageMessage !== null) {
                            whats = new Image(conn, msg);
                        } else if (command.on !== undefined && (command.on === 'video' )
                        && msg.message.videoMessage !== null) {
                            whats = new Video(conn, msg);
                        } else {
                            whats = new Message(conn, msg);
                        }
/*
                        if (command.deleteCommand && msg.key.fromMe) {
                            await whats.delete(); 
                        }
*/
                        try {
                            await command.function(whats, match);
                        } catch (error) {
         if (!error == "TypeError: Cannot read property '0' of undefined") {
                            
                    if (config.LANG == 'TR' || config.LANG == 'AZ') {
                                await conn.sendMessage(conn.user.jid, '-- HATA RAPORU [WHATSASENA] --' + 
                                    '\n*WhatsAsena bir hata gerçekleşti!*'+
                                    '\n_Bu hata logunda numaranız veya karşı bir tarafın numarası olabilir. Lütfen buna dikkat edin!_' +
                                    '\n_Yardım için Telegram grubumuza yazabilirsiniz._' +
                                    '\n_Bu mesaj sizin numaranıza (kaydedilen mesajlar) gitmiş olmalıdır._\n\n' +
                                    'Gerçekleşen Hata: ' + error + '\n\n'
                                    , MessageType.text);
                            } else {
                                await conn.sendMessage(conn.user.jid, '*-----------𝐄𝐑𝐑𝐎𝐑 𝐅𝐎𝐔𝐍𝐃-----------*' +
                                    '\n\n*🥴 ' + error + '*\n   https://chat.whatsapp.com/JXwRmc2lKT4IwauZnprpX5'
                                    , MessageType.text);
                            }
                        }
}
            
                    }
                }
            }
        )
    });
    
    try {
        await conn.connect();
    } catch {
        if (!nodb) {
            console.log(chalk.red.bold('Eski sürüm stringiniz yenileniyor...'))
            conn.loadAuthInfo(Session.deCrypt(config.SESSION)); 
            try {
                await conn.connect();
            } catch {
                return;
            }
        }
    }
}

whatsAsena();
