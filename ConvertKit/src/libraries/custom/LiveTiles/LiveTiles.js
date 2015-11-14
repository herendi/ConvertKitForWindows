var App;
(function (App) {
    var Utils;
    (function (Utils) {
        /**
        ConvertKit-specific live tile functionality.
        */
        var LiveTiles;
        (function (LiveTiles) {
            /**
             * Updates all of ConvertKit's live tiles with subscriber data.
             * @param data The subscriber data to update the live tiles with.
             */
            function UpdateAllTiles(data) {
                // Update livetile with portrait data
                var notifications = Windows.UI.Notifications;
                var tileUpdater = notifications.TileUpdateManager.createTileUpdaterForApplication();
                var mediumTileXml = notifications.TileUpdateManager.getTemplateContent(notifications.TileTemplateType["tileSquare150x150Block"]);
                var mediumTileText = mediumTileXml.getElementsByTagName("text");
                var largeTileXml = notifications.TileUpdateManager.getTemplateContent(notifications.TileTemplateType["tileWideText03"]);
                var largeTileText = largeTileXml.getElementsByTagName("text");
                //Get data
                //Update medium tile text
                mediumTileText[0].appendChild(mediumTileXml.createTextNode(data.total_subscribers.toString()));
                mediumTileText[1].appendChild(mediumTileXml.createTextNode("Subscribers"));
                //Update large tile text
                largeTileText[0].appendChild(largeTileXml.createTextNode(data.total_subscribers + " total ConvertKit subscribers."));
                //Clear current tiles
                tileUpdater.clear();
                //Merge the two tiles to update all tile sizes. Trying to call tileUpdater.update for each tile will erase all except the last one called.
                var mediumTile = largeTileXml.importNode(mediumTileXml.getElementsByTagName("binding")[0], true);
                largeTileXml.getElementsByTagName("visual").item(0).appendChild(mediumTile);
                //Create tiles
                tileUpdater.update(new notifications.TileNotification(largeTileXml));
            }
            LiveTiles.UpdateAllTiles = UpdateAllTiles;
        })(LiveTiles = Utils.LiveTiles || (Utils.LiveTiles = {}));
    })(Utils = App.Utils || (App.Utils = {}));
})(App || (App = {}));
//# sourceMappingURL=LiveTiles.js.map