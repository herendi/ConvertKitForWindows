/**
A custom binding handler that prevents Knockout from applying bindings to an object.
Prevents a page-level ko.applyBindings from binding a partial view that calls
ko.applyBindings itself.
*/
ko.bindingHandlers["stopBinding"] = {
    init: function () {
        return { controlsDescendantBindings: true };
    }
};
ko.virtualElements.allowedBindings["stopBinding"] = true;
//# sourceMappingURL=Knockout.StopBinding.js.map