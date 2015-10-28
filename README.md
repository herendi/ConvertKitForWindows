# ConvertKit for Windows

This is a public repository for the (unofficial) [ConvertKit](https://convertkit.com) for Windows app. This app will soon be in the Windows app store.

## WinJS Issue #1408

This app is experiencing a crash when trying to show a message dialog directly from a secondary AppBarCommand's "onclick" property. When you expand the AppBar and click on "Sign out", the app will call [`App.HomeController.HandleSignoutEvent`](https://github.com/nozzlegear/ConvertKitForWindows/blob/WinJS-Issue-1408/ConvertKit/src/pages/home/HomeController.ts#L120). As stated, that function tries to show a message dialog, but instead crashes with the following error:

![An outgoing call cannot be made since the application is dispatching an input-synchronous call.](https://i.imgur.com/7Y7UYXy.png)

Things I've tried:

1. Place the content of `App.HomeController.HandleSignoutEvent` in a timeout and wait for up to **3** seconds. The app will still crash.
2. Place the content of `App.HomeController.HandleSignoutEvent` in a WinJS promise. The app will still crash.
3. Place a breakpoint in `App.HomeController.HandleSignoutEvent` right before the `this.ShowDialog` call, then "continue" execution after it's hit. **This works**, and is the only way that the app will not crash.

To reproduce the problem, I've set the app to debug mode. Just fire it up, expand the AppBar after the page loads and click on the "Sign out" secondary command. The app will crash with the error shown above.

![The crash](https://zippy.gfycat.com/UnconsciousPresentAntarcticfurseal.gif)