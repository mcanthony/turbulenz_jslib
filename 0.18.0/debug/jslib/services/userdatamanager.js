// Copyright (c) 2011 Turbulenz Limited

//
// API
//
function UserDataManager() {}
UserDataManager.prototype =
{
    version : 1,
    keyValidate: new RegExp("^[A-Za-z0-9]+([\\-\\.][A-Za-z0-9]+)*$"),

    validateKey: function validateKeyFn(key)
    {
        if (!key || typeof(key) !== "string")
        {
            this.errorCallbackFn("Invalid key string (Key string is empty or not a string)");
            return false;
        }

        if (!this.keyValidate.test(key))
        {
            this.errorCallbackFn("Invalid key string (Only alphanumeric characters and .- are permitted)");
            return false;
        }

        return key;
    },

    getKeys: function userdataManagerGetKeysFn(callbackFn, errorCallbackFn)
    {
        var that = this;
        function getKeysCallbackFn(jsonResponse, status)
        {
            if (status === 200)
            {
                callbackFn(jsonResponse.keys || jsonResponse.array);
            }
            else
            {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.getKeys failed with status " + status + ": " + jsonResponse.msg,
                              status,
                              that.getKeys,
                              [callbackFn]);
            }
        }

        var dataSpec = {};
        dataSpec.gameSessionId = that.gameSessionId;

        Utilities.ajax({
            url: '/api/v1/user-data/get-keys',
            method: 'GET',
            async: true,
            data: dataSpec,
            callback: getKeysCallbackFn,
            encrypt: true,
            requestHandler: this.requestHandler
        });
    },

    exists: function userdataManagerExistsFn(key, callbackFn, errorCallbackFn)
    {
        if (!this.validateKey(key))
        {
            return;
        }

        var that = this;
        function existsCallbackFn(jsonResponse, status)
        {
            if (status === 200)
            {
                callbackFn(key, jsonResponse.exists);
            }
            else
            {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.exists failed with status " + status + ": " + jsonResponse.msg,
                              status,
                              that.exists,
                              [key, callbackFn]);
            }
        }

        var dataSpec = {};
        dataSpec.gameSessionId = that.gameSessionId;

        Utilities.ajax({
            url: '/api/v1/user-data/exists/' + key,
            method: 'GET',
            async: true,
            data: dataSpec,
            callback: existsCallbackFn,
            encrypt: true,
            requestHandler: this.requestHandler
        });
    },

    get: function userdataManagerGetFn(key, callbackFn, errorCallbackFn)
    {
        if (!this.validateKey(key))
        {
            return;
        }

        var that = this;
        function getCallbackFn(jsonResponse, status)
        {
            if (status === 200)
            {
                callbackFn(key, jsonResponse.value);
            }
            else if (status === 404)
            {
                callbackFn(key, null);
            }
            else
            {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.get failed with status " + status + ": " + jsonResponse.msg,
                              status,
                              that.get,
                              [key, callbackFn]);
            }
        }

        var dataSpec = {};
        dataSpec.gameSessionId = that.gameSessionId;

        Utilities.ajax({
            url: '/api/v1/user-data/get/' + key,
            method: 'GET',
            async: true,
            data: dataSpec,
            callback: getCallbackFn,
            encrypt: true,
            requestHandler: this.requestHandler
        });
    },

    set: function userdataManagerSetFn(key, value, callbackFn, errorCallbackFn)
    {
        if (!this.validateKey(key))
        {
            return;
        }

        if (!value)
        {
            this.remove(key, callbackFn);
            return;
        }

        var that = this;
        function setCallbackFn(responseText, status)
        {
            if (status === 200)
            {
                callbackFn(key);
            }
            else
            {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.set failed with status " + status + ": " + responseText,
                              status,
                              that.set,
                              [key, value, callbackFn]);
            }
        }

        var dataSpec = {};
        dataSpec.value = value;
        dataSpec.gameSessionId = that.gameSessionId;

        Utilities.ajax({
            url: '/api/v1/user-data/set/' + key,
            method: 'POST',
            async: true,
            data : dataSpec,
            callback: setCallbackFn,
            encrypt: true,
            requestHandler: this.requestHandler
        });
    },

    remove: function userdataManagerRemoveFn(key, callbackFn, errorCallbackFn)
    {
        if (!this.validateKey(key))
        {
            return;
        }

        var that = this;
        function removeCallbackFn(responseText, status)
        {
            if (status === 200)
            {
                callbackFn(key);
            }
            else if (status === 404)
            {
                callbackFn(key);
            }
            else
            {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.remove failed with status " + status + ": " + responseText,
                              status,
                              that.remove,
                              [key, callbackFn]);
            }
        }

        var dataSpec = {};
        dataSpec.gameSessionId = that.gameSessionId;

        Utilities.ajax({
            url: '/api/v1/user-data/remove/' + key,
            method: 'POST',
            async: true,
            data: dataSpec,
            callback: removeCallbackFn,
            encrypt: true,
            requestHandler: this.requestHandler
        });
    },

    removeAll: function userdataManagerRemoveAllFn(callbackFn, errorCallbackFn)
    {
        var that = this;
        function removeAllCallbackFn(responseText, status)
        {
            if (status === 200)
            {
                callbackFn();
            }
            else
            {
                var errorCallback = errorCallbackFn || that.errorCallbackFn;
                errorCallback("UserDataManager.removeAll failed with status " + status + ": " + responseText,
                              status,
                              that.removeAll,
                              [callbackFn]);
            }
        }

        var dataSpec = {};
        dataSpec.gameSessionId = that.gameSessionId;

        Utilities.ajax({
            url: '/api/v1/user-data/remove-all',
            method: 'POST',
            async: true,
            data: dataSpec,
            callback: removeAllCallbackFn,
            encrypt: true,
            requestHandler: this.requestHandler
        });
    }

};

// Constructor function
UserDataManager.create = function UserDataManagerCreateFn(requestHandler, gameSession, errorCallbackFn)
{
    if (!TurbulenzServices.available())
    {
        return null;
    }

    var userdataManager = new UserDataManager();
    userdataManager.requestHandler = requestHandler;
    userdataManager.errorCallbackFn = errorCallbackFn || TurbulenzServices.defaultErrorCallback;
    userdataManager.gameSessionId = gameSession.gameSessionId;

    return userdataManager;
};
