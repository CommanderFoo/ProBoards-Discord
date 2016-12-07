/**
* @license
* The MIT License (MIT)
*
* Copyright (c) 2016 pixeldepth.net - http://support.proboards.com/user/2671
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*/

class ProBoards_Discord {

	static init(){
		this.PLUGIN_ID = "pd_discord";
		this.server = null;
		this.server_data = null;
		this.images = null;
		this.last_time = 0;

		this.setup();

		if(this.server){
			$(this.ready.bind(this));
		}
	}

	// Poll every 25 seconds

	static fetch_server_data(current_time){
		if(!this.last_time || current_time >= (this.last_time + 25000)){
			this.last_time = current_time;

			let url = "https://discordapp.com/api/guilds/" + this.server + "/widget.json?r=" + Math.random();

			$.getJSON(url, (data) => {
					this.server_data = data;
					this.update();
				}
			);
		}

		requestAnimationFrame(this.fetch_server_data.bind(this));
	}

	// Could fetch the data much earlier, but if the info area isn't on the page
	// then it becomes a waste of a http request, so we just do it all in the ready.

	static ready(){
		if(this.add_info_row()){
			requestAnimationFrame(this.fetch_server_data.bind(this));
		}
	}

	static setup(){
		let plugin = pb.plugin.get(this.PLUGIN_ID);

		if(plugin && plugin.settings){
			let plugin_settings = plugin.settings;

			if(plugin_settings.server_id.length){
				this.server = plugin_settings.server_id;
			}

			if(plugin.images){
				this.images = plugin.images;
			}
		}
	}

	static add_info_row(){
		let $last_row = $(".stats table tr.last");

		if($last_row.length){
			let $new_last_row = $last_row.clone();

			$last_row.removeClass("last");

			if(this.images){
				$new_last_row.find(".icon img").attr("src", this.images.discord).attr("title", "Discord").attr("alt", "Discord");
			}

			let $info = $new_last_row.find(".info");

			$info.find("th").text("Discord users online");

			let $online = $info.find("tr:first-child").next();

			$online.empty().attr("id", "discord-online").html("No users online.");
			$last_row.parent().append($new_last_row);

			return true;
		}

		return false;
	}

	static fetch_all_members(){
		if(this.server_data.members && this.server_data.members.length){
			let $online = $("<div>");
			let counter = 0;

			for(let m = 0; m < this.server_data.members.length; m ++){
				let member = this.server_data.members[m];
				let css = (member.status == "idle" || member.status == "dnd")? " style='font-style: italic'" : "";
				let nick = (member.nick)? member.nick : member.username;
				let title = "User is online";

				if(member.status == "idle"){
					title = "User is idle";
				} else if(member.status == "dnd"){
					title = "User does not want to be disturbed";
				}

				$online.append($("<span class='discord-user'" + css + " title='" + title + "'></span>").text(nick));

				if(counter < (this.server_data.members.length - 1)){
					$online.append(", ");
				}

				counter ++;
			}

			if(counter){
				return $online;
			}
		}

		return null;
	}

	static update(){
		let $info = $("#discord-online");

		if($info.length){
			let members = this.fetch_all_members();

			if(members){
				$info.html(members);
			}
		}
	}

}

ProBoards_Discord.init();