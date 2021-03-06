/**
 * @fileoverview Provide translatable strings for the UI
 */
define({
	common: {
		refresh: 'Reloading ',
		old_password: "Your old password",
		new_password: "Your new password",
		load_indication: "Loading ",
		initial_load_indication: "Loading TUI..."
	},
	player: {
		states: {
			playing: 'Playing: ',
			buffering: 'Buffering: ',
			paused: 'Paused: ',
			starting: 'Starting: '
		}
	},
	lists: {
		sorting: {
			sortByIndex: 'Sort by Index, Bookmarked first',
			sortByName: 'Sort by Name'
		},
		noContent: "There are no items in this category",
		lock: "Lock",
		unlock: "Unlock",
		bookmark: "Bookmark",
		unbookmark: "Unbookmark",
		actionFailed: "The selected action cannot be completed",
		resumePlay: 'Resume',
		play: 'Play'
	},
	epg: {
		panels: {
			bottom: {
				upDown: "Scroll",
				info: "Hide EPG",
				ok: "Select",
				'return': "Deactivate",
				ok_alternate: "Rec/Switch"
			}
		}
	},
	games: {
		panels: {
			bottom: {
				ok: "Start game",
				'return': "End game"
			}
		},
		hints: {
			Sudoku: {
				ok: "Check validity",
				arrows: "Move around"
			},
			Tetris: {
				arrows: 'Move'
			},
			SizzleBox: {
				arrows: 'Move tiles'
			},
			Hangman: {
				arrows: "Select letter",
				ok: "Use letter"
			}
		}
	},
	screens: {
		setup: {
			header: {
				settings: "Parameter",
				value: "Value"
			}
		},
		iptv: {
			panels: {
				bottom: {
					info: 'Show EPG',
					ok: 'Select',
					playPause: 'Options',
					'return': "Apply changes"
				}
			},
            errors: {
                cannotSchedule: "Scheduling failed",
                scheduled: "Schedule saved"
            }
		},
		callcenter: {
			panels: {
				bottom: {

				}
			},
			list: {

			}
		},
		general: {
			panels: {
				bottom: {
					'return': 'Apply changes'
				}
			}
		},
		voip: {
			panels: {
				bottom: {
					'return': 'Apply changes'
				}
			}
		},
		wifi: {
			panels: {
				bottom: {
					'return': 'Apply changes'
				}
			}
		},
		lannetworking: {
			panels: {
				bottom: {
					'return': 'Apply changes'
				}
			}
		},
		sms: {
			panels: {
				bottom: {
					arrows: "Navigate"
				}
			},
			list: {
				header: {

				},
				body: {
					to: "To:",
					message: "Text:"
				}
			}
		},
		phonebook: {
			panels: {
				bottom: {
					ok: "Call now",
					info: "Contact options",
					upDown: "Select"
				}
			},
			list: {
				header: {
					name: "Name",
					number: "Number",
					speedDial: "SD"
				}
			}
		},
		voicemail: {
			panels: {
				bottom: {
					upDown: "Navigation",
					ok: "Listen"
				}
			},
			list: {
				header: {

				},
				body: {
					caller: "Call from",
					time: "Time of call"
				}
			}
		},
		callhistory: {
			panels: {
				bottom: {
					ok: "Call"
				}
			},
			list: {
				header: {
					caller: "Caller Name",
					time: "Time of call",
					duration: "Call duration",
					type: "Type"
				}
			}
		},
		chooser: {
			panels: {
				bottom: {
					leftRight: "Scroll",
					ok: "Select"
				}
			},
			list: {
				header: {

				},
				body: {
					callcenter: "Call Centre",
					history: "Call History",
					voicemail: "Voice Mail",
					sms: "Send SMS",
					phonebook: "Phonebook"
				}
			}
		},
		incall: {
			panels: {
				bottom: {
					'return': 'Go to menu',
					upDown: 'Switch line'
				}
			},
			list: {
				header: {

				},
				body: {
					statuses: {
						nocall: "No current call"
					}
				}
			}
		}
	},
	components: {
		dialogs: {
			confirmApply: "Save changes?",
            confirmPay: "Please confirm charges of ",
			select: "Select action",
			lock: "Password",
			wrongPassword: "The password is incorrect",
			ok: 'OK',
			cancel: 'Cancel',
			updateFailed: 'Update failed<br>',
			ytube: {
				mostPopular: "Most popular",
				topRated: "Top Rated",
				mostViewed: "Most Viewed",
				recent: "Recent Videos",
				'search': "Search",
				select: 'Choose Category',
				searchquery: 'Enter your search query'
			}
		}
	}
});
