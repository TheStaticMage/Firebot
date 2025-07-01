"use strict";

/**
 * @typedef QuickActionDefinition
 * @prop {string} id
 * @prop {string} name
 * @prop {"system" | "custom"} type
 * @prop {string} icon
 * @prop {string} [presetListId]
 */

/**
 * @typedef QuickActionProperties
 * @prop {boolean} [customizable]
 * @prop {boolean} [hasDefaultAction]
 * @prop {string} [modalHelpText]
 */

/**
 * @typedef QuickActionTrigger
 * @prop {string} quickActionId
 * @prop {Object} [params]
 */

/**
 * @typedef QuickActionTriggerEvent
 * @prop {object} config
 * @prop {Object} params
 */

/**
 * @typedef FontAwesomeIcon
 * @prop {string} name
 * @prop {string} className
 * @prop {string} style
 * @prop {string[]} searchTerms
 */

exports.unused = {};
