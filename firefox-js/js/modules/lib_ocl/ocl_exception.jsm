/*
 * This file is part of WebCL – Web Computing Language.
 *
 * This Source Code Form is subject to the terms of the
 * Mozilla Public License, v. 2.0. If a copy of the MPL
 * was not distributed with this file, You can obtain
 * one at http://mozilla.org/MPL/2.0/.
 *
 * The Original Contributor of this Source Code Form is
 * Nokia Research Center Tampere (http://webcl.nokiaresearch.com).
 *
 */


var EXPORTED_SYMBOLS = [ "CLException", "CLInvalidated", "CLUnsupportedInfo", "CLInternalError", "CLInvalidArgument", "CLNotImplemented", "CLError",
                         "INVALID_VALUE", "INVALID_DEVICE", "INVALID_BUILD_OPTIONS", "INVALID_CONTEXT", "INVALID_OPERATION", "INVALID_EVENT",
                         "INVALID_ARG_INDEX", "INVALID_ARG_VALUE", "INVALID_ARG_SIZE" ];


const Cu = Components.utils;
const Cr = Components.results;

Cu.import ("resource://nrcwebcl/modules/logger.jsm");
Cu.import ("resource://nrcwebcl/modules/lib_ocl/ocl_constants.jsm");


try {


function CLException (msg, context)
{
  this.msg = msg ? String(msg) : "";
  this.context = context ? String(context) : "";
}

CLException.prototype.toString = function ()
{
  return (this.context ? this.context + ": " : "CLException: ") + this.msg;
};



function CLInvalidated (msg)
{
  CLException.apply (this);
  this.msg = msg ? String(msg) : "";
}
CLInvalidated.prototype = Object.create (CLException.prototype);

CLInvalidated.prototype.toString = function ()
{
  return "Invalid object" + (msg ? ": " + msg : "") + ".";
};



// errCode: Number, OpenCL error code or undefined if none.
// msg:     String, Textual description.
// context: String, Exception context description.
function CLError (errCode, msg, context)
{
  CLException.apply (this);

  try
  {
    if (errCode)
    {
      if (!isNaN(+errCode))
      {
        this.err = +errCode;
        this.name = oclErrorToString (errCode);

        // Drop "CL_" prefix if any
        if (this.name.substr(0,3) == "CL_")
        {
          this.name = this.name.substr(3);
        }

        this.msg = this.name;
      }
    }
  }
  catch(e)
  {
    this.msg = "Failed to generate exception.";
    DEBUG ("CLError: " + this.msg + " (errCode="+errCode+" msg="+msg+" context="+context+") E:"+e);
  }

  if (msg)
  {
    this.msg = String(msg);
  }

  if (context)
  {
    this.context = String(context);
  }
}
CLError.prototype = Object.create (CLException.prototype);

CLError.prototype.toString = function ()
{
  var s = "";
  if (this.context) s = this.context + ":";
  if (this.name) s += (s ? " " : "") + this.name;
  if (this.msg) s += (s ? " " : "") + this.msg;
  return s;
};


function CLUnsupportedInfo (name, msg, context)
{
  CLException.apply (this);
  this.name = name;
  this.msg = msg;
  this.context = context;
}
CLUnsupportedInfo.prototype = Object.create (CLException.prototype);

CLUnsupportedInfo.prototype.toString = function ()
{
  var msg = this.msg || "Unsupported info name";
  if (!isNaN(+this.name))
  {
    var name = oclInfoToString (this.name);
    // Drop "CL_" prefix if any
    if (name.substr(0,3) == "CL_")
    {
      name = name.substr(3);
    }
  }
  else
  {
    var name = String(this.name);
  }

  return msg + ": " + name;
};



function CLInternalError (msg, context)
{
  CLException.call (this, msg, context);
}
CLInternalError.prototype = Object.create (CLException.prototype);

CLInternalError.prototype.toString = function ()
{
  return "[Internal error] " + CLException.prototype.toString.apply (this);
};



function CLInvalidArgument (argName, msg, context)
{
  CLException.call (this, msg, context);

  this.argName = String(argName);
}
CLInvalidArgument.prototype = Object.create (CLException.prototype);

CLInvalidArgument.prototype.toString = function ()
{
  var s = (this.context ? this.context + ": " : "");
  s += (this.msg ? this.msg : "Invalid argument");
  return s + ": " + this.argName;
};



function CLNotImplemented (name)
{
  CLException.apply (this);
  this.name = name;
}
CLNotImplemented.prototype = Object.create (CLException.prototype);

CLNotImplemented.prototype.toString = function ()
{
  return "Not implemented" + (this.name ? ": "+this.name : "");
};


//  Specialized constructors for commonly used OpenCL errors.
//
function INVALID_VALUE (msg, value)
{
  msg += "'" + value + "'" + " (typeof " + typeof(value) + ")";
  CLError.call(this, ocl_errors.CL_INVALID_VALUE, msg);
};
INVALID_VALUE.prototype = Object.create (CLError.prototype);


function INVALID_DEVICE (msg, value)
{
  msg += "'" + value + "'" + " (typeof " + typeof(value) + ")";
  CLError.call(this, ocl_errors.CL_INVALID_DEVICE, msg);
};
INVALID_DEVICE.prototype = Object.create (CLError.prototype);


function INVALID_ARG_INDEX (msg, value)
{
  msg += "'" + value + "'" + " (typeof " + typeof(value) + ")";
  CLError.call(this, ocl_errors.CL_INVALID_ARG_INDEX, msg);
};
INVALID_ARG_INDEX.prototype = Object.create (CLError.prototype);


function INVALID_ARG_VALUE (msg, value)
{
  msg += "'" + value + "'" + " (typeof " + typeof(value) + ")";
  CLError.call(this, ocl_errors.CL_INVALID_ARG_VALUE, msg);
};
INVALID_ARG_VALUE.prototype = Object.create (CLError.prototype);


function INVALID_ARG_SIZE (msg, value)
{
  msg += "'" + value + "'" + " (typeof " + typeof(value) + ")";
  CLError.call(this, ocl_errors.CL_INVALID_ARG_SIZE, msg);
};
INVALID_ARG_SIZE.prototype = Object.create (CLError.prototype);


function INVALID_BUILD_OPTIONS (msg, value)
{
  msg += "'" + value + "'" + " (typeof " + typeof(value) + ")";
  CLError.call(this, ocl_errors.CL_INVALID_BUILD_OPTIONS, msg);
};
INVALID_BUILD_OPTIONS.prototype = Object.create (CLError.prototype);


function INVALID_CONTEXT (msg)
{
  CLError.call(this, ocl_errors.CL_INVALID_CONTEXT, msg);
};
INVALID_CONTEXT.prototype = Object.create (CLError.prototype);


function INVALID_OPERATION (msg)
{
  CLError.call(this, ocl_errors.CL_INVALID_OPERATION, msg);
};
INVALID_OPERATION.prototype = Object.create (CLError.prototype);


function INVALID_EVENT (msg)
{
  CLError.call(this, ocl_errors.CL_INVALID_EVENT, msg);
};
INVALID_EVENT.prototype = Object.create (CLError.prototype);



} catch (e) { ERROR ("exception.jsm: " + e + "."); throw e; }
