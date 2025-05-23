/* Goo Engine scriptpack 0.11.3
 * Copyright 2014 Goo Technologies AB
 */
(function(window) {
    function f() {
        define("goo/scriptpack/AxisAlignedCamControlScript", ["goo/math/Vector3", "goo/scripts/ScriptUtils", "goo/math/MathUtils"], function(e, t, n) {
            function r() {
                function t(t, i) {
                    i.axis = new e(e.UNIT_Z), i.upAxis = new e(e.UNIT_Y), r(t, i, t.view), i.currentView = t.view, i.lookAtPoint = new e(e.ZERO), i.distance = t.distance, i.smoothness = Math.pow(n.clamp(t.smoothness, 0, 1), .3), i.axisAlignedDirty = !0
                }

                function r(t, n, r) {
                    if (n.currentView === r) return;
                    n.currentView = r;
                    switch (r) {
                        case "XY":
                            n.axis.setv(e.UNIT_Z), n.upAxis.setv(e.UNIT_Y);
                            break;
                        case "ZY":
                            n.axis.setv(e.UNIT_X), n.upAxis.setv(e.UNIT_Y)
                    }
                    n.axisAlignedDirty = !0
                }

                function i(e, t) {
                    e.view !== t.currentView && (t.axisAlignedDirty = !0);
                    if (!t.axisAlignedDirty) return;
                    var n = t.entity,
                        r = n.transformComponent.transform;
                    r.translation.setv(t.axis).scale(t.distance).addv(t.lookAtPoint), r.lookAt(t.lookAtPoint, t.upAxis), n.transformComponent.setUpdated(), t.axisAlignedDirty = !1
                }

                function s() {}
                return {
                    setup: t,
                    update: i,
                    cleanup: s
                }
            }
            return r.externals = {
                key: "AxisAlignedCamControlScript",
                name: "Axis-aligned Camera Control",
                description: "Aligns a camera along an axis, and enables switching between them.",
                parameters: [{
                    key: "whenUsed",
                    name: "When Camera Used",
                    description: "Script only runs when the camera to which it is added is being used.",
                    "default": !0,
                    type: "boolean"
                }, {
                    key: "distance",
                    name: "Distance",
                    type: "float",
                    description: "Camera distance from lookat point",
                    control: "slider",
                    "default": 10,
                    min: 1,
                    max: 1e5
                }, {
                    key: "view",
                    type: "string",
                    "default": "XY",
                    control: "select",
                    options: ["XY", "ZY"]
                }]
            }, r
        }), define("goo/scriptpack/BasicControlScript", ["goo/math/Vector3", "goo/math/Matrix3x3"], function(e, t) {
            function n(n) {
                n = n || {}, this.domElement = n.domElement === undefined ? null : n.domElement.domElement || n.domElement, this.name = "BasicControlScript", this.movementSpeed = 10, this.rollSpeed = 2, this.movementSpeedMultiplier = 1, this.mouseStatus = 0, this.moveState = {
                    up: 0,
                    down: 0,
                    left: 0,
                    right: 0,
                    forward: 0,
                    back: 0,
                    pitchUp: 0,
                    pitchDown: 0,
                    yawLeft: 0,
                    yawRight: 0,
                    rollLeft: 0,
                    rollRight: 0
                }, this.moveVector = new e(0, 0, 0), this.rotationVector = new e(0, 0, 0), this.multiplier = new e(1, 1, 1), this.rotationMatrix = new t, this.tmpVec = new e, this.handleEvent = function(e) {
                    typeof this[e.type] == "function" && this[e.type](e)
                }, this.keydown = function(e) {
                    if (e.altKey) return;
                    switch (e.keyCode) {
                        case 16:
                            this.movementSpeedMultiplier = .1;
                            break;
                        case 87:
                            this.moveState.forward = 1;
                            break;
                        case 83:
                            this.moveState.back = 1;
                            break;
                        case 65:
                            this.moveState.left = 1;
                            break;
                        case 68:
                            this.moveState.right = 1;
                            break;
                        case 82:
                            this.moveState.up = 1;
                            break;
                        case 70:
                            this.moveState.down = 1;
                            break;
                        case 38:
                            this.moveState.pitchUp = 1;
                            break;
                        case 40:
                            this.moveState.pitchDown = 1;
                            break;
                        case 37:
                            this.moveState.yawLeft = 1;
                            break;
                        case 39:
                            this.moveState.yawRight = 1;
                            break;
                        case 81:
                            this.moveState.rollLeft = 1;
                            break;
                        case 69:
                            this.moveState.rollRight = 1
                    }
                    this.updateMovementVector(), this.updateRotationVector()
                }, this.keyup = function(e) {
                    switch (e.keyCode) {
                        case 16:
                            this.movementSpeedMultiplier = 1;
                            break;
                        case 87:
                            this.moveState.forward = 0;
                            break;
                        case 83:
                            this.moveState.back = 0;
                            break;
                        case 65:
                            this.moveState.left = 0;
                            break;
                        case 68:
                            this.moveState.right = 0;
                            break;
                        case 82:
                            this.moveState.up = 0;
                            break;
                        case 70:
                            this.moveState.down = 0;
                            break;
                        case 38:
                            this.moveState.pitchUp = 0;
                            break;
                        case 40:
                            this.moveState.pitchDown = 0;
                            break;
                        case 37:
                            this.moveState.yawLeft = 0;
                            break;
                        case 39:
                            this.moveState.yawRight = 0;
                            break;
                        case 81:
                            this.moveState.rollLeft = 0;
                            break;
                        case 69:
                            this.moveState.rollRight = 0
                    }
                    this.updateMovementVector(), this.updateRotationVector()
                }, this.mousedown = function(e) {
                    this.domElement !== document && this.domElement.focus(), e.preventDefault(), e = e.touches && e.touches.length === 1 ? e.touches[0] : e, this.mouseDownX = e.pageX, this.mouseDownY = e.pageY, this.mouseStatus = 1, document.addEventListener("mousemove", this.mousemove, !1), document.addEventListener("mouseup", this.mouseup, !1), document.addEventListener("touchmove", this.mousemove, !1), document.addEventListener("touchend", this.mouseup, !1)
                }.bind(this), this.mousemove = function(e) {
                    this.mouseStatus > 0 && (e = e.touches && e.touches.length === 1 ? e.touches[0] : e, this.moveState.yawLeft = e.pageX - this.mouseDownX, this.moveState.pitchDown = e.pageY - this.mouseDownY, this.updateRotationVector(), this.mouseDownX = e.pageX, this.mouseDownY = e.pageY)
                }.bind(this), this.mouseup = function(e) {
                    if (!this.mouseStatus) return;
                    e.preventDefault(), this.mouseStatus = 0, this.moveState.yawLeft = this.moveState.pitchDown = 0, this.updateRotationVector(), document.removeEventListener("mousemove", this.mousemove), document.removeEventListener("mouseup", this.mouseup), document.removeEventListener("touchmove", this.mousemove), document.removeEventListener("touchend", this.mouseup)
                }.bind(this), this.updateMovementVector = function() {
                    var e = this.moveState.forward || this.autoForward && !this.moveState.back ? 1 : 0;
                    this.moveVector.x = -this.moveState.left + this.moveState.right, this.moveVector.y = -this.moveState.down + this.moveState.up, this.moveVector.z = -e + this.moveState.back
                }, this.updateRotationVector = function() {
                    this.rotationVector.x = -this.moveState.pitchDown + this.moveState.pitchUp, this.rotationVector.y = -this.moveState.yawRight + this.moveState.yawLeft, this.rotationVector.z = -this.moveState.rollRight + this.moveState.rollLeft
                }, this.getContainerDimensions = function() {
                    return this.domElement !== document ? {
                        size: [this.domElement.offsetWidth, this.domElement.offsetHeight],
                        offset: [this.domElement.offsetLeft, this.domElement.offsetTop]
                    } : {
                        size: [window.innerWidth, window.innerHeight],
                        offset: [0, 0]
                    }
                }, this.domElement && this.setupMouseControls(), this.updateMovementVector(), this.updateRotationVector()
            }
            return n.prototype.setupMouseControls = function() {
                this.domElement.setAttribute("tabindex", -1), this.domElement.addEventListener("mousedown", this.mousedown, !1), this.domElement.addEventListener("touchstart", this.mousedown, !1), this.domElement.addEventListener("keydown", this.keydown.bind(this), !1), this.domElement.addEventListener("keyup", this.keyup.bind(this), !1)
            }, n.prototype.externals = function() {
                return [{
                    variable: "movementSpeed",
                    type: "number"
                }, {
                    variable: "rollSpeed",
                    type: "number"
                }]
            }, n.prototype.run = function(t, n, r) {
                r && !this.domElement && r.domElement && (this.domElement = r.domElement, this.setupMouseControls());
                var i = t.transformComponent,
                    s = i.transform,
                    o = t._world.tpf,
                    u = o * this.movementSpeed * this.movementSpeedMultiplier,
                    a = o * this.rollSpeed * this.movementSpeedMultiplier;
                if (!this.moveVector.equals(e.ZERO) || !this.rotationVector.equals(e.ZERO) || this.mouseStatus > 0) s.translation.x += this.moveVector.x * u, s.translation.y += this.moveVector.y * u, s.translation.z += this.moveVector.z * u, this.tmpVec.x += -this.rotationVector.x * a * this.multiplier.x, this.tmpVec.y += this.rotationVector.y * a * this.multiplier.y, this.tmpVec.z += this.rotationVector.z * a * this.multiplier.z, s.rotation.fromAngles(this.tmpVec.x, this.tmpVec.y, this.tmpVec.z), this.mouseStatus > 0 && (this.moveState.yawLeft = 0, this.moveState.pitchDown = 0, this.updateRotationVector()), i.setUpdated()
            }, n
        }), define("goo/scriptpack/ButtonScript", ["goo/math/Vector3", "goo/scripts/Scripts", "goo/scripts/ScriptUtils", "goo/renderer/Renderer", "goo/entities/SystemBus"], function(e, t, n, r, i) {
            function s() {
                function e(e, n) {
                    n.button = ["Any", "Left", "Middle", "Right"].indexOf(e.button) - 1, n.button < -1 && (n.button = -1), n.renderToPickHandler = function() {
                        n.skipUpdateBuffer = !0
                    }, i.addListener("ButtonScript.renderToPick", n.renderToPickHandler, !1), n.mouseState = {
                        x: 0,
                        y: 0,
                        down: !1,
                        downOnEntity: !1,
                        overEntity: !1
                    }, n.listeners = {
                        mousedown: function(r) {
                            if (!e.whenUsed) return;
                            var i = s(r);
                            if (i === n.button || n.button === -1) n.mouseState.down = !0, t(e, n, r), o(e, n, "mousedown")
                        },
                        mouseup: function(r) {
                            if (!e.whenUsed) return;
                            var i = s(r);
                            if (i === n.button || n.button === -1) n.mouseState.down = !1, t(e, n, r), n.mouseState.downOnEntity && o(e, n, "click"), o(e, n, "mouseup")
                        },
                        dblclick: function(r) {
                            if (!e.whenUsed) return;
                            var i = s(r);
                            if (i === n.button || n.button === -1) n.mouseState.down = !1, t(e, n, r), o(e, n, "dblclick")
                        },
                        mousemove: function(r) {
                            if (!e.whenUsed || !e.enableOnMouseMove) return;
                            n.mouseState.down = !1, t(e, n, r), o(e, n, "mousemove")
                        },
                        touchstart: function(t) {
                            if (!e.whenUsed) return;
                            n.mouseState.down = !0;
                            var r = t.targetTouches,
                                i = n.domElement.getBoundingClientRect();
                            n.mouseState.x = r[0].pageX - i.left, n.mouseState.y = r[0].pageY - i.top, o(e, n, "touchstart")
                        },
                        touchend: function() {
                            if (!e.whenUsed) return;
                            n.mouseState.down = !1, o(e, n, "touchend")
                        }
                    };
                    for (var r in n.listeners) n.domElement.addEventListener(r, n.listeners[r])
                }

                function t(e, t, n) {
                    var r = t.domElement.getBoundingClientRect();
                    t.mouseState.x = n.pageX - r.left, t.mouseState.y = n.pageY - r.top
                }

                function n(e, t) {
                    t.skipUpdateBuffer = !1
                }

                function r(e, t) {
                    for (var n in t.listeners) t.domElement.removeEventListener(n, t.listeners[n]);
                    i.removeListener("ButtonScript.renderToPick", t.renderToPickHandler)
                }

                function s(e) {
                    var t = e.button;
                    return t === 0 && (e.altKey ? t = 2 : e.shiftKey && (t = 1)), t
                }

                function o(e, t, n) {
                    var r = t.entity._world.gooRunner,
                        s = r.pickSync(t.mouseState.x, t.mouseState.y, t.skipUpdateBuffer);
                    t.skipUpdateBuffer || i.emit("ButtonScript.renderToPick");
                    var o = r.world.entityManager.getEntityByIndex(s.id);
                    t.mouseState.downOnEntity = !1;
                    if (o === t.entity) {
                        i.emit(e.channel + "." + n, {
                            type: n,
                            entity: o
                        });
                        if (n === "mousedown" || n === "touchstart") t.mouseState.downOnEntity = !0;
                        e.linkUrl && n === "click" && window.open(e.linkUrl, e.linkTarget)
                    }
                    n === "mousemove" && !t.mouseState.overEntity && o === t.entity && i.emit(e.channel + ".mouseover", {
                        type: "mouseover",
                        entity: o
                    }), n === "mousemove" && t.mouseState.overEntity && o !== t.entity && i.emit(e.channel + ".mouseout", {
                        type: "mouseout",
                        entity: o
                    }), t.mouseState.overEntity = o === t.entity
                }
                return {
                    setup: e,
                    update: n,
                    cleanup: r
                }
            }
            return s.externals = {
                key: "ButtonScript",
                name: "Button",
                description: "Enables an entity to be interacted with using click or touch.",
                parameters: [{
                    key: "whenUsed",
                    type: "boolean",
                    "default": !0
                }, {
                    key: "button",
                    name: "button",
                    description: "Only interact with this mouse button.",
                    type: "string",
                    control: "select",
                    "default": "Any",
                    options: ["Any", "Left", "Middle", "Right"]
                }, {
                    key: "linkUrl",
                    name: "linkUrl",
                    description: "URL to open when clicking the entity. Leave this field empty to disable.",
                    type: "string",
                    "default": ""
                }, {
                    key: "linkTarget",
                    name: "linkTarget",
                    description: "The window to open the link in.",
                    type: "string",
                    "default": "_blank"
                }, {
                    key: "channel",
                    name: "channel",
                    description: "Event channel to emit to. Will emit channel.click, .mousedown, .mouseup, .mouseover, .mouseout, .dblclick, .touchstart, .touchend",
                    type: "string",
                    "default": "button"
                }, {
                    key: "enableOnMouseMove",
                    name: "enableOnMouseMove",
                    description: "Enables .mousemove, .mouseover, and .mouseout events. For larger scenes, this might be worth turning off, for better performance.",
                    type: "boolean",
                    "default": !0
                }]
            }, s
        }), define("goo/scriptpack/CannonPickScript", ["goo/math/Vector3", "goo/scripts/Scripts", "goo/scripts/ScriptUtils", "goo/renderer/Renderer", "goo/math/Plane"], function(e, t, n, r, i) {
            function o() {
                function v(e) {
                    var t = e[0].clientX,
                        n = e[0].clientY,
                        r = e[1].clientX,
                        i = e[1].clientY,
                        s = (t + r) / 2,
                        o = (n + i) / 2;
                    return [s, o]
                }

                function m(r, i) {
                    f = ["Any", "Left", "Middle", "Right"].indexOf(r.pickButton) - 1, f < -1 && (f = -1), l = i.goingToLookAt, t = new e(e.UNIT_Y), n = (new e(e.UNIT_X)).invert(), o = new e, u = new e, a = new e;
                    var d = i.world.gooRunner.renderer;
                    h = d._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / d.svg.currentScale : 1, p = i.world.getSystem("CannonSystem");
                    var m = new s.Sphere(.1),
                        g = i.jointBody = new s.RigidBody(0, m);
                    g.collisionFilterGroup = 2, g.collisionFilterMask = 2, p.world.add(g), c = {
                        x: 0,
                        y: 0,
                        ox: 0,
                        oy: 0,
                        dx: 0,
                        dy: 0,
                        down: !1
                    };
                    var y = i.listeners = {
                        mousedown: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity) {
                                var t = e.button;
                                t === 0 && (e.altKey ? t = 2 : e.shiftKey && (t = 1));
                                if (t === f || f === -1) c.down = !0, c.ox = c.x = e.clientX, c.oy = c.y = e.clientY
                            }
                        },
                        mouseup: function(e) {
                            var t = e.button;
                            t === 0 && (e.altKey ? t = 2 : e.shiftKey && (t = 1));
                            if (t === f || f === -1) c.down = !1, c.dx = c.dy = 0
                        },
                        mousemove: function(e) {
                            (!r.whenUsed || i.entity === i.activeCameraEntity) && c.down && (c.x = e.clientX, c.y = e.clientY, i.dirty = !0)
                        },
                        mouseleave: function() {
                            c.down = !1, c.ox = c.x, c.oy = c.y
                        },
                        touchstart: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity) {
                                c.down = e.targetTouches.length === 2;
                                if (!c.down) return;
                                var t = v(e.targetTouches);
                                c.ox = c.x = t[0], c.oy = c.y = t[1]
                            }
                        },
                        touchmove: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity) {
                                if (!c.down) return;
                                var t = v(e.targetTouches);
                                c.x = t[0], c.y = t[1]
                            }
                        },
                        touchend: function() {
                            c.down = !1, c.ox = c.x, c.oy = c.y
                        }
                    };
                    for (var b in y) i.domElement.addEventListener(b, y[b]);
                    i.dirty = !0
                }

                function g(t, n) {
                    c.dx = c.x - c.ox, c.dy = c.y - c.oy, c.ox = c.x, c.oy = c.y;
                    var i = r.mainCamera;
                    if (i && c.down && !n.mouseConstraint) {
                        var o = [],
                            u = n.world.by.system("CannonSystem").toArray();
                        for (var a = 0; a < u.length; a++) {
                            var f = u[a].cannonRigidbodyComponent.body;
                            f && f.shape instanceof s.Box && f.motionstate === s.Body.DYNAMIC && o.push(f)
                        }
                        var l = i.getPickRay(c.x, c.y, window.innerWidth, window.innerHeight),
                            h = new s.Vec3(l.origin.x, l.origin.y, l.origin.z),
                            p = new s.Vec3(l.direction.x, l.direction.y, l.direction.z),
                            v = new s.Ray(h, p),
                            m = v.intersectBodies(o);
                        if (m.length) {
                            var f = m[0].body,
                                g = m[0].point;
                            b(t, n, g.x, g.y, g.z, f, l.direction.mul(-1))
                        }
                    } else if (i && c.down && n.mouseConstraint && (c.dx !== 0 || c.dy !== 0)) {
                        var i = r.mainCamera,
                            l = i.getPickRay(c.x, c.y, window.innerWidth, window.innerHeight),
                            y = new e;
                        d.rayIntersect(l, y, !0), w(t, n, y)
                    } else c.down || E(t, n)
                }

                function y(e, t) {
                    for (var n in t.listeners) t.domElement.removeEventListener(n, t.listeners[n])
                }

                function b(t, n, r, i, o, u, a) {
                    n.constrainedBody = u;
                    var f = (new s.Vec3(r, i, o)).vsub(n.constrainedBody.position),
                        l = n.constrainedBody.quaternion.inverse(),
                        c = l.vmult(f);
                    n.jointBody.position.set(r, i, o), n.mouseConstraint = new s.PointToPointConstraint(n.constrainedBody, c, n.jointBody, new s.Vec3(0, 0, 0)), p.world.addConstraint(n.mouseConstraint);
                    var h = new e(r, i, o);
                    d.constant = h.dot(a), d.normal.setv(a)
                }

                function w(e, t, n) {
                    t.jointBody.position.set(n.x, n.y, n.z), t.mouseConstraint.update()
                }

                function E(e, t) {
                    p.world.removeConstraint(t.mouseConstraint), t.mouseConstraint = !1
                }
                var t, n, o, u, a, f, l, c, h, p, d = new i;
                return {
                    setup: m,
                    update: g,
                    cleanup: y
                }
            }
            var s = window.CANNON;
            return o.externals = {
                key: "CannonPickScript",
                name: "Cannon.js Body Pick",
                description: "Enables the user to physically pick a Cannon.js physics body and drag it around.",
                parameters: [{
                    key: "whenUsed",
                    type: "boolean",
                    "default": !0
                }, {
                    key: "pickButton",
                    name: "Pan button",
                    description: "Pick with this button",
                    type: "string",
                    control: "select",
                    "default": "Any",
                    options: ["Any", "Left", "Middle", "Right"]
                }, {
                    key: "useForceNormal",
                    name: "Use force normal",
                    type: "boolean",
                    "default": !1
                }, {
                    key: "forceNormal",
                    name: "Force normal",
                    "default": [0, 0, 1],
                    type: "vec3"
                }]
            }, o
        }), define("goo/scriptpack/WASDControlScript", ["goo/math/Vector3", "goo/scripts/Scripts", "goo/scripts/ScriptUtils"], function(e, t, n) {
            function r() {
                function c() {
                    f.x = o.strafeLeft - o.strafeRight, f.z = o.forward - o.back
                }

                function h(e) {
                    if (e.altKey) return;
                    switch (n.keyForCode(e.keyCode)) {
                        case s.crawlKey:
                            o.speed = s.crawlSpeed;
                            break;
                        case s.forwardKey:
                            o.forward = 1, c();
                            break;
                        case s.backKey:
                            o.back = 1, c();
                            break;
                        case s.strafeLeftKey:
                            o.strafeLeft = 1, c();
                            break;
                        case s.strafeRightKey:
                            o.strafeRight = 1, c()
                    }
                }

                function p(e) {
                    if (e.altKey) return;
                    switch (n.keyForCode(e.keyCode)) {
                        case s.crawlKey:
                            o.speed = s.walkSpeed;
                            break;
                        case s.forwardKey:
                            o.forward = 0, c();
                            break;
                        case s.backKey:
                            o.back = 0, c();
                            break;
                        case s.strafeLeftKey:
                            o.strafeLeft = 0, c();
                            break;
                        case s.strafeRightKey:
                            o.strafeRight = 0, c()
                    }
                }

                function d(e) {
                    e.setAttribute("tabindex", -1), e.addEventListener("keydown", h, !1), e.addEventListener("keyup", p, !1)
                }

                function v(e, n) {
                    s = e, n.moveState = o = {
                        strafeLeft: 0,
                        strafeRight: 0,
                        forward: 0,
                        back: 0,
                        crawling: !1,
                        speed: e.walkSpeed
                    }, t = n.entity, r = t.transformComponent, i = r.transform, d(n.domElement)
                }

                function m(t, n) {
                    if (f.equals(e.ZERO)) return;
                    if (t.whenUsed && n.entity !== n.activeCameraEntity) return;
                    l.set(u.x * f.z + a.x * f.x, u.y * f.z + a.y * f.x, u.z * f.z + a.z * f.x), l.normalize();
                    var s = n.world.tpf * o.speed;
                    l.mul(s);
                    var c = i.rotation;
                    c.applyPost(l), i.translation.add(l), r.setUpdated()
                }

                function g(e, t) {
                    t.domElement.removeEventListener("keydown", h, !1), t.domElement.removeEventListener("keyup", p, !1)
                }
                var t, r, i, s, o, u = new e(0, 0, -1),
                    a = new e(-1, 0, 0),
                    f = new e,
                    l = new e;
                return {
                    setup: v,
                    update: m,
                    cleanup: g
                }
            }
            return r.externals = {
                key: "WASD",
                name: "WASD Control",
                description: "Enables moving via the WASD keys",
                parameters: [{
                    key: "whenUsed",
                    type: "boolean",
                    name: "When Camera Used",
                    description: "Script only runs when the camera to which it is added is being used.",
                    "default": !0
                }, {
                    key: "crawlKey",
                    type: "string",
                    control: "key",
                    "default": "Shift"
                }, {
                    key: "forwardKey",
                    type: "string",
                    control: "key",
                    "default": "W"
                }, {
                    key: "backKey",
                    type: "string",
                    control: "key",
                    "default": "S"
                }, {
                    key: "strafeLeftKey",
                    type: "string",
                    control: "key",
                    "default": "A"
                }, {
                    key: "strafeRightKey",
                    type: "string",
                    control: "key",
                    "default": "D"
                }, {
                    key: "walkSpeed",
                    type: "int",
                    control: "slider",
                    "default": 10,
                    min: 1,
                    max: 100,
                    exponential: !0
                }, {
                    key: "crawlSpeed",
                    control: "slider",
                    type: "int",
                    "default": 1,
                    min: .1,
                    max: 10,
                    exponential: !0
                }]
            }, r
        }), define("goo/scriptpack/MouseLookControlScript", ["goo/scripts/Scripts", "goo/math/Vector3", "goo/math/MathUtils", "goo/util/GameUtils"], function(e, t, n, r) {
            function i() {
                function p(t) {
                    if (!c.whenUsed || l.entity === l.activeCameraEntity)
                        if (f === -1 || t.button === f) e = !0, i = o = t.clientX, s = u = t.clientY
                }

                function d() {
                    document.pointerLockElement || r.requestPointerLock()
                }

                function v(t) {
                    (!c.whenUsed || l.entity === l.activeCameraEntity) && e && (t.movementX !== undefined ? (o += t.movementX, u += t.movementY) : (o = t.clientX, u = t.clientY))
                }

                function m() {
                    e = !1
                }

                function g() {
                    e = !!document.pointerLockElement, document.pointerLockElement ? l.domElement.removeEventListener("mousedown", d) : l.domElement.addEventListener("mousedown", d)
                }

                function y(e, n) {
                    l = n, c = e, f = ["Any", "Left", "Middle", "Right", "None"].indexOf(e.button) - 1, f < -1 && (f = -1);
                    var i = n.domElement;
                    f === 3 ? (document.addEventListener("pointerlockchange", g), document.addEventListener("mousemove", v), i.addEventListener("mousedown", d), r.requestPointerLock()) : (i.addEventListener("mousedown", p), i.addEventListener("mouseup", m), i.addEventListener("mouseleave", m), i.addEventListener("mousemove", v)), a = new t;
                    var s = n.entity.transformComponent.transform.rotation;
                    s.toAngles(a), h = a.data[1]
                }

                function b(e, t) {
                    if (o === i && u === s) return;
                    var r = o - i,
                        f = u - s,
                        l = t.entity,
                        c = l.transformComponent.transform.rotation;
                    c.toAngles(a);
                    var p = a.data[0],
                        d = a.data[1],
                        v = e.maxAscent * n.DEG_TO_RAD,
                        m = e.minAscent * n.DEG_TO_RAD;
                    p = n.clamp(p - f * e.speed / 200, m, v);
                    var g = e.maxAzimuth * n.DEG_TO_RAD - h,
                        y = e.minAzimuth * n.DEG_TO_RAD - h;
                    d -= r * e.speed / 200, e.clampAzimuth && (d = n.radialClamp(d, y, g)), c.fromAngles(p, d, 0), l.transformComponent.setUpdated(), i = o, s = u
                }

                function w(e, t) {
                    var n = t.domElement;
                    f === 3 ? (r.exitPointerLock(), document.removeEventListener("mousemove", v), n.removeEventListener("mousedown", d), document.removeEventListener("pointerlockchange", g)) : (n.removeEventListener("mousemove", v), n.removeEventListener("mousedown", p), n.removeEventListener("mouseup", m), n.removeEventListener("mouseleave", m))
                }
                var e = !1,
                    i = 0,
                    s = 0,
                    o = 0,
                    u = 0,
                    a, f, l, c, h;
                return {
                    setup: y,
                    update: b,
                    cleanup: w
                }
            }
            return i.externals = {
                key: "MouseLookScript",
                name: "Mouse Look Control",
                description: "Click and drag to change rotation of entity, usually a camera",
                parameters: [{
                    key: "whenUsed",
                    type: "boolean",
                    name: "When Camera Used",
                    description: "Script only runs when the camera to which it is added is being used.",
                    "default": !0
                }, {
                    key: "button",
                    name: "Mouse button",
                    type: "string",
                    control: "select",
                    "default": "Left",
                    options: ["Any", "Left", "Middle", "Right", "None"]
                }, {
                    key: "speed",
                    name: "Turn Speed",
                    type: "float",
                    control: "slider",
                    "default": 1,
                    min: -10,
                    max: 10,
                    scale: .1
                }, {
                    key: "maxAscent",
                    name: "Max Ascent",
                    type: "float",
                    control: "slider",
                    "default": 89.95,
                    min: -89.95,
                    max: 89.95
                }, {
                    key: "minAscent",
                    name: "Min Ascent",
                    type: "float",
                    control: "slider",
                    "default": -89.95,
                    min: -89.95,
                    max: 89.95
                }, {
                    key: "clampAzimuth",
                    "default": !1,
                    type: "boolean"
                }, {
                    key: "minAzimuth",
                    description: "Maximum arc the camera can reach clockwise of the target point",
                    "default": -90,
                    type: "int",
                    control: "slider",
                    min: -180,
                    max: 0
                }, {
                    key: "maxAzimuth",
                    description: "Maximum arc the camera can reach counter-clockwise of the target point",
                    "default": 90,
                    type: "int",
                    control: "slider",
                    min: 0,
                    max: 180
                }]
            }, i
        }), define("goo/scriptpack/FlyControlScript", ["goo/scripts/Scripts", "goo/scriptpack/WASDControlScript", "goo/scriptpack/MouseLookControlScript"], function(e, t, n) {
            function r() {
                function s(e, t) {
                    i.setup(e, t), r.setup(e, t)
                }

                function o(e, t) {
                    i.update(e, t), r.update(e, t)
                }

                function u(e, t) {
                    i.cleanup(e, t), r.cleanup(e, t)
                }
                var r = e.create(t),
                    i = e.create(n);
                return {
                    setup: s,
                    cleanup: u,
                    update: o
                }
            }
            var i = t.externals.parameters,
                s = n.externals.parameters,
                o = i.concat(s.slice(1));
            return r.externals = {
                key: "FlyControlScript",
                name: "Fly Control",
                description: "This is a combo of WASDscript and mouselookscript",
                parameters: o
            }, r
        }), define("goo/scriptpack/GroundBoundMovementScript", ["goo/math/Vector3"], function(e) {
            function r(t) {
                t = t || {};
                for (var r in n) typeof n[r] == "boolean" ? this[r] = t[r] !== undefined ? t[r] === !0 : n[r] : isNaN(n[r]) ? n[r] instanceof e ? this[r] = t[r] ? new e(t[r]) : (new e).set(n[r]) : this[r] = t[r] || n[r] : this[r] = isNaN(t[r]) ? n[r] : t[r];
                this.groundContact = 1, this.targetVelocity = new e, this.targetHeading = new e, this.acceleration = new e, this.torque = new e, this.groundHeight = 0, this.groundNormal = new e, this.controlState = {
                    run: 0,
                    strafe: 0,
                    jump: 0,
                    yaw: 0,
                    roll: 0,
                    pitch: 0
                }
            }
            var t = new e,
                n = {
                    gravity: -9.81,
                    worldFloor: -Infinity,
                    jumpImpulse: 95,
                    accLerp: .1,
                    rotLerp: .1,
                    modForward: 1,
                    modStrafe: .7,
                    modBack: .4,
                    modTurn: .3
                };
            return r.prototype.setTerrainSystem = function(e) {
                this.terrainScript = e
            }, r.prototype.getTerrainSystem = function() {
                return this.terrainScript
            }, r.prototype.getTerrainHeight = function(e) {
                var t = this.getTerrainSystem().getTerrainHeightAt(e.data);
                return t === null && (t = this.worldFloor), t
            }, r.prototype.getTerrainNormal = function(e) {
                return this.getTerrainSystem().getTerrainNormalAt(e.data)
            }, r.prototype.applyForward = function(e) {
                this.controlState.run = e
            }, r.prototype.applyStrafe = function(e) {
                this.controlState.strafe = e
            }, r.prototype.applyJump = function(e) {
                this.controlState.jump = e
            }, r.prototype.applyTurn = function(e) {
                this.controlState.yaw = e
            }, r.prototype.applyJumpImpulse = function(e) {
                return this.groundContact && (this.controlState.jump ? (e = this.jumpImpulse, this.controlState.jump = 0) : e = 0), e
            }, r.prototype.applyDirectionalModulation = function(e, t, n) {
                e *= this.modStrafe, n > 0 ? n *= this.modForward : n *= this.modBack, this.targetVelocity.set(e, this.applyJumpImpulse(t), n)
            }, r.prototype.applyTorqueModulation = function(e, t, n) {
                this.targetHeading.set(e, t * this.modTurn, n)
            }, r.prototype.applyGroundNormalInfluence = function() {
                var e = Math.abs(Math.cos(this.groundNormal.data[0])),
                    t = Math.abs(Math.cos(this.groundNormal.data[2]));
                this.targetVelocity.data[0] *= e, this.targetVelocity.data[2] *= t
            }, r.prototype.updateTargetVectors = function(e) {
                this.applyDirectionalModulation(this.controlState.strafe, this.gravity, this.controlState.run), e.rotation.applyPost(this.targetVelocity), this.applyGroundNormalInfluence(), this.applyTorqueModulation(this.controlState.pitch, this.controlState.yaw, this.controlState.roll)
            }, r.prototype.computeAcceleration = function(e, n, r) {
                return t.set(r), e.transformComponent.transform.rotation.applyPost(t), t.sub(n), t.lerp(r, this.accLerp), t.data[1] = r.data[1], t
            }, r.prototype.computeTorque = function(e, n) {
                return t.set(n), t.sub(e), t.lerp(n, this.rotLerp), t
            }, r.prototype.updateVelocities = function(e) {
                var t = e.movementComponent.getVelocity(),
                    n = e.movementComponent.getRotationVelocity();
                this.acceleration.set(this.computeAcceleration(e, t, this.targetVelocity)), this.torque.set(this.computeTorque(n, this.targetHeading))
            }, r.prototype.applyAccelerations = function(e) {
                e.movementComponent.addVelocity(this.acceleration), e.movementComponent.addRotationVelocity(this.torque)
            }, r.prototype.updateGroundNormal = function(e) {
                this.groundNormal.set(this.getTerrainNormal(e.translation))
            }, r.prototype.checkGroundContact = function(e, t) {
                this.groundHeight = this.getTerrainHeight(t.translation), t.translation.data[1] <= this.groundHeight ? (this.groundContact = 1, this.updateGroundNormal(t)) : this.groundContact = 0
            }, r.prototype.applyGroundContact = function(e, t) {
                this.groundHeight >= t.translation.data[1] && (t.translation.data[1] = this.groundHeight, e.movementComponent.velocity.data[1] < 0 && (e.movementComponent.velocity.data[1] = 0))
            }, r.prototype.run = function(e) {
                var t = e.transformComponent.transform;
                this.checkGroundContact(e, t), this.updateTargetVectors(t), this.updateVelocities(e), this.applyAccelerations(e), this.applyGroundContact(e, t)
            }, r
        }), define("goo/scriptpack/HeightMapBoundingScript", ["goo/math/MathUtils"], function(e) {
            function t(e) {
                this.matrixData = e, this.width = e.length - 1
            }
            return t.prototype.getMatrixData = function() {
                return this.matrixData
            }, t.prototype.getPointInMatrix = function(e, t) {
                return this.matrixData[e][t]
            }, t.prototype.getAt = function(e, t) {
                return e < 0 || e > this.width || t < 0 || t > this.width ? 0 : this.getPointInMatrix(e, t)
            }, t.prototype.getInterpolated = function(e, t) {
                var n = this.getAt(Math.ceil(e), Math.ceil(t)),
                    r = this.getAt(Math.ceil(e), Math.floor(t)),
                    i = this.getAt(Math.floor(e), Math.ceil(t)),
                    s = this.getAt(Math.floor(e), Math.floor(t)),
                    o = e - Math.floor(e),
                    u = t - Math.floor(t),
                    a = n * o + i * (1 - o),
                    f = r * o + s * (1 - o),
                    l = a * u + f * (1 - u);
                return l
            }, t.prototype.getTriangleAt = function(e, t) {
                var n = Math.ceil(e),
                    r = Math.floor(e),
                    i = Math.ceil(t),
                    s = Math.floor(t),
                    o = e - r,
                    u = t - s,
                    a = {
                        x: r,
                        y: i,
                        z: this.getAt(r, i)
                    },
                    f = {
                        x: n,
                        y: s,
                        z: this.getAt(n, s)
                    },
                    l;
                return o < 1 - u ? l = {
                    x: r,
                    y: s,
                    z: this.getAt(r, s)
                } : l = {
                    x: n,
                    y: i,
                    z: this.getAt(n, i)
                }, [a, f, l]
            }, t.prototype.getPreciseHeight = function(t, n) {
                var r = this.getTriangleAt(t, n),
                    i = e.barycentricInterpolation(r[0], r[1], r[2], {
                        x: t,
                        y: n,
                        z: 0
                    });
                return i.z
            }, t.prototype.run = function(e) {
                var t = e.transformComponent.transform.translation;
                t.data[1] = this.getInterpolated(t.data[2], t.data[0])
            }, t
        }), define("goo/scriptpack/LensFlareScript", ["goo/math/Vector3", "goo/util/ParticleSystemUtils", "goo/renderer/Material", "goo/renderer/shaders/ShaderLib", "goo/shapes/Quad"], function(e, t, n, r, i) {
            function s() {
                function d(e) {
                    h.size = e, h.splash = t.createSplashTexture(512, {
                        trailStartRadius: 25,
                        trailEndRadius: 0
                    }), h.ring = t.createFlareTexture(e, {
                        steps: p.ring,
                        startRadius: e / 4,
                        endRadius: e / 2
                    }), h.dot = t.createFlareTexture(e, {
                        steps: p.dot,
                        startRadius: 0,
                        endRadius: e / 2
                    }), h.bell = t.createFlareTexture(e, {
                        steps: p.bell,
                        startRadius: 0,
                        endRadius: e / 2
                    }), h["default"] = t.createFlareTexture(e, {
                        steps: p.none,
                        startRadius: 0,
                        endRadius: e / 2
                    })
                }

                function v(e, t, i, s, o) {
                    for (var a = 0; a < e.length; a++) {
                        var l = e[a];
                        n.push(new u(t, l.tx, l.displace, l.size, l.intensity * f, i, s, o, h, r))
                    }
                    return n
                }

                function m(e) {
                    for (var t = 0; t < e.length; t++) e[t].quad.removeFromWorld()
                }

                function g(t, u) {
                    f = t.intensity, c = new o(t.edgeRelevance * 100);
                    var p = l;
                    t.highRes && (p *= 4), h.size !== p && d(p), n = [], e = u.entity, r = u.world, i = !1, a = [t.color[0], t.color[1], t.color[2], 1], s = [{
                        size: 2.53,
                        tx: "bell",
                        intensity: .7,
                        displace: 1
                    }, {
                        size: .53,
                        tx: "dot",
                        intensity: .7,
                        displace: 1
                    }, {
                        size: .83,
                        tx: "bell",
                        intensity: .2,
                        displace: .8
                    }, {
                        size: .4,
                        tx: "ring",
                        intensity: .1,
                        displace: .6
                    }, {
                        size: .3,
                        tx: "bell",
                        intensity: .1,
                        displace: .4
                    }, {
                        size: .6,
                        tx: "bell",
                        intensity: .1,
                        displace: .3
                    }, {
                        size: .3,
                        tx: "dot",
                        intensity: .1,
                        displace: .15
                    }, {
                        size: .22,
                        tx: "ring",
                        intensity: .03,
                        displace: -0.25
                    }, {
                        size: .36,
                        tx: "dot",
                        intensity: .05,
                        displace: -0.5
                    }, {
                        size: .8,
                        tx: "ring",
                        intensity: .1,
                        displace: -0.8
                    }, {
                        size: .86,
                        tx: "bell",
                        intensity: .2,
                        displace: -1.1
                    }, {
                        size: 1.3,
                        tx: "ring",
                        intensity: .05,
                        displace: -1.5
                    }]
                }

                function y() {
                    m(n), n = []
                }

                function b(t, r) {
                    if (r.entity.isVisible !== !1) {
                        c.updateFrameGeometry(e, r.activeCameraEntity), i || (n = v(s, a, t.scale, t.edgeDampen, t.edgeScaling), i = !0);
                        for (var o = 0; o < n.length; o++) n[o].updatePosition(c)
                    } else i && (m(n), i = !1)
                }
                var e, n = [],
                    r, i, s, a, f, l = 64,
                    c, h = {},
                    p = {
                        splash: {
                            trailStartRadius: 25,
                            trailEndRadius: 0
                        },
                        ring: [{
                            fraction: 0,
                            value: 0
                        }, {
                            fraction: .7,
                            value: 0
                        }, {
                            fraction: .92,
                            value: 1
                        }, {
                            fraction: .98,
                            value: 0
                        }],
                        dot: [{
                            fraction: 0,
                            value: 1
                        }, {
                            fraction: .3,
                            value: .75
                        }, {
                            fraction: .5,
                            value: .45
                        }, {
                            fraction: .65,
                            value: .21
                        }, {
                            fraction: .75,
                            value: .1
                        }, {
                            fraction: .98,
                            value: 0
                        }],
                        bell: [{
                            fraction: 0,
                            value: 1
                        }, {
                            fraction: .15,
                            value: .75
                        }, {
                            fraction: .3,
                            value: .5
                        }, {
                            fraction: .4,
                            value: .25
                        }, {
                            fraction: .75,
                            value: .05
                        }, {
                            fraction: .98,
                            value: 0
                        }],
                        none: [{
                            fraction: 0,
                            value: 1
                        }, {
                            fraction: 1,
                            value: 0
                        }]
                    };
                return {
                    setup: g,
                    update: b,
                    cleanup: y
                }
            }

            function o(t) {
                this.camRot = null, this.distance = 0, this.offset = 0, this.centerRatio = 0, this.positionVector = new e, this.distanceVector = new e, this.centerVector = new e, this.displacementVector = new e, this.edgeRelevance = t
            }

            function u(t, s, o, u, a, f, l, c, h, p) {
                this.sizeVector = new e(u, u, u), this.sizeVector.mul(f), this.positionVector = new e, this.flareVector = new e, this.intensity = a, this.displace = o, this.color = [t[0] * a, t[1] * a, t[2] * a, 1], this.edgeDampen = l, this.edgeScaling = c;
                var d = new n(r.uber, "flareShader");
                d.uniforms.materialEmissive = this.color, d.uniforms.materialDiffuse = [0, 0, 0, 1], d.uniforms.materialAmbient = [0, 0, 0, 1], d.uniforms.materialSpecular = [0, 0, 0, 1];
                var v = h[s];
                d.setTexture("DIFFUSE_MAP", v), d.setTexture("EMISSIVE_MAP", v), d.blendState.blending = "AdditiveBlending", d.blendState.blendEquation = "AddEquation", d.blendState.blendSrc = "OneFactor", d.blendState.blendDst = "OneFactor", d.depthState.enabled = !1, d.depthState.write = !1, d.cullState.enabled = !1;
                var m = new i(1, 1),
                    g = p.createEntity(m, d);
                g.meshRendererComponent.cullMode = "Never", g.addToWorld(), this.material = d, this.quad = g
            }
            return s.externals = {
                key: "LensFlareScript",
                name: "LensFlareScript",
                description: "Makes an entity shine with some lensflare effect.",
                parameters: [{
                    key: "scale",
                    name: "Scale",
                    type: "float",
                    description: "Scale of flare quads",
                    control: "slider",
                    "default": 1,
                    min: .01,
                    max: 2
                }, {
                    key: "intensity",
                    name: "Intensity",
                    type: "float",
                    description: "Intensity of Effect",
                    control: "slider",
                    "default": 1,
                    min: .01,
                    max: 2
                }, {
                    key: "edgeRelevance",
                    name: "Edge Relevance",
                    type: "float",
                    description: "How much the effect cares about being centered or not",
                    control: "slider",
                    "default": 0,
                    min: 0,
                    max: 2
                }, {
                    key: "edgeDampen",
                    name: "Edge Dampening",
                    type: "float",
                    description: "Intensity adjustment by distance from center",
                    control: "slider",
                    "default": .2,
                    min: 0,
                    max: 1
                }, {
                    key: "edgeScaling",
                    name: "Edge Scaling",
                    type: "float",
                    description: "Scale adjustment by distance from center",
                    control: "slider",
                    "default": 0,
                    min: -2,
                    max: 2
                }, {
                    key: "color",
                    name: "Color",
                    type: "vec3",
                    description: "Effect Color",
                    control: "color",
                    "default": [.8, .75, .7]
                }, {
                    key: "highRes",
                    name: "High Resolution",
                    type: "boolean",
                    description: "Intensity of Effect",
                    control: "checkbox",
                    "default": !1
                }]
            }, o.prototype.updateFrameGeometry = function(e, t) {
                this.camRot = t.transformComponent.transform.rotation, this.centerVector.set(t.cameraComponent.camera.translation), this.displacementVector.set(e.getTranslation()), this.displacementVector.sub(this.centerVector), this.distance = this.displacementVector.length(), this.distanceVector.set(0, 0, -this.distance), this.camRot.applyPost(this.distanceVector), this.centerVector.add(this.distanceVector), this.positionVector.set(this.centerVector), this.displacementVector.set(e.getTranslation()), this.displacementVector.sub(this.positionVector), this.offset = this.displacementVector.length(), this.centerRatio = 1 - 1 / (this.positionVector.length() / (this.offset * this.edgeRelevance)), this.centerRatio = Math.max(0, this.centerRatio)
            }, u.prototype.updatePosition = function(e) {
                this.flareVector.set(e.displacementVector), this.positionVector.set(e.positionVector), this.flareVector.mul(this.displace), this.positionVector.add(this.flareVector), this.material.uniforms.materialEmissive = [this.color[0] * e.centerRatio * this.edgeDampen, this.color[1] * e.centerRatio * this.edgeDampen, this.color[2] * e.centerRatio * this.edgeDampen, 1];
                var t = e.distance + e.distance * e.centerRatio * this.edgeScaling,
                    n = this.quad.transformComponent.transform;
                n.scale.set(this.sizeVector), n.scale.mul(t), n.rotation.set(e.camRot), n.translation.set(this.positionVector), this.quad.transformComponent.updateTransform(), this.quad.transformComponent.updateWorldTransform()
            }, s
        }), define("goo/scriptpack/PanCamScript", ["goo/math/Vector3", "goo/scripts/Scripts", "goo/scripts/ScriptUtils", "goo/renderer/Renderer", "goo/entities/SystemBus", "goo/renderer/Camera"], function(e, t, n, r, i, s) {
            function o() {
                function p(e) {
                    var t = e[0].clientX,
                        n = e[0].clientY,
                        r = e[1].clientX,
                        i = e[1].clientY,
                        s = (t + r) / 2,
                        o = (n + i) / 2;
                    return [s, o]
                }

                function d(r, i) {
                    f = ["Any", "Left", "Middle", "Right"].indexOf(r.panButton) - 1, f < -1 && (f = -1), l = i.goingToLookAt, t = new e(e.UNIT_Y), n = (new e(e.UNIT_X)).invert(), o = new e, u = new e, a = new e;
                    var s = i.world.gooRunner.renderer;
                    i.devicePixelRatio = s._useDevicePixelRatio && window.devicePixelRatio ? window.devicePixelRatio / s.svg.currentScale : 1, c = {
                        x: 0,
                        y: 0,
                        ox: 0,
                        oy: 0,
                        dx: 0,
                        dy: 0,
                        down: !1
                    }, h = {
                        mousedown: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity) {
                                var t = e.button;
                                t === 0 && (e.altKey ? t = 2 : e.shiftKey && (t = 1));
                                if (t === f || f === -1) {
                                    c.down = !0;
                                    var n = e.offsetX !== undefined ? e.offsetX : e.layerX,
                                        s = e.offsetY !== undefined ? e.offsetY : e.layerY;
                                    c.ox = c.x = n, c.oy = c.y = s
                                }
                            }
                        },
                        mouseup: function(e) {
                            var t = e.button;
                            t === 0 && (e.altKey ? t = 2 : e.shiftKey && (t = 1)), c.down = !1, c.dx = c.dy = 0
                        },
                        mousemove: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity)
                                if (c.down) {
                                    var t = e.offsetX !== undefined ? e.offsetX : e.layerX,
                                        n = e.offsetY !== undefined ? e.offsetY : e.layerY;
                                    c.x = t, c.y = n, i.dirty = !0
                                }
                        },
                        mouseleave: function() {
                            c.down = !1, c.ox = c.x, c.oy = c.y
                        },
                        touchstart: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity) {
                                c.down = e.targetTouches.length === 2;
                                if (!c.down) return;
                                var t = p(e.targetTouches);
                                c.ox = c.x = t[0], c.oy = c.y = t[1]
                            }
                        },
                        touchmove: function(e) {
                            if (!r.whenUsed || i.entity === i.activeCameraEntity) {
                                if (!c.down) return;
                                var t = p(e.targetTouches);
                                c.x = t[0], c.y = t[1]
                            }
                        },
                        touchend: function() {
                            c.down = !1, c.ox = c.x, c.oy = c.y
                        }
                    };
                    for (var d in h) i.domElement.addEventListener(d, h[d]);
                    i.dirty = !0
                }

                function v(e, o) {
                    if (!o.dirty) return;
                    c.dx = c.x - c.ox, c.dy = c.y - c.oy;
                    if (c.dx === 0 && c.dy === 0) {
                        o.dirty = !!o.lookAtPoint;
                        return
                    }
                    e.invertX && (c.dx = -c.dx), e.invertY && (c.dy = -c.dy), c.ox = c.x, c.oy = c.y;
                    var f = r.mainCamera,
                        h = o.entity,
                        p = h.transformComponent.transform,
                        d = h.cameraComponent.camera;
                    if (l && f) {
                        if (l.equals(f.translation)) return;
                        var v = o.viewportWidth / o.devicePixelRatio,
                            m = o.viewportHeight / o.devicePixelRatio;
                        f.getScreenCoordinates(l, v, m, u), u.sub_d(c.dx, c.dy, 0), f.getWorldCoordinates(u.x, u.y, v, m, u.z, u), l.setv(u)
                    } else {
                        u.setv(t).scale(c.dy), a.setv(n).scale(c.dx);
                        if (h.cameraComponent && h.cameraComponent.camera) {
                            var d = h.cameraComponent.camera;
                            u.scale((d._frustumTop - d._frustumBottom) / o.viewportHeight), a.scale((d._frustumRight - d._frustumLeft) / o.viewportWidth)
                        }
                        u.addv(a), p.rotation.applyPost(u), d.projectionMode === s.Perspective ? u.scale(e.panSpeed * 20) : u.scale(e.panSpeed), h.transformComponent.transform.translation.addv(u), h.transformComponent.setUpdated(), o.dirty = !1
                    }
                    i.emit("goo.cameraPositionChanged", {
                        translation: p.translation.data,
                        lookAtPoint: l ? l.data : null,
                        id: h.id
                    })
                }

                function m(e, t) {
                    for (var n in h) t.domElement.removeEventListener(n, h[n])
                }
                var t, n, o, u, a, f, l, c, h;
                return {
                    setup: d,
                    update: v,
                    cleanup: m
                }
            }
            return o.externals = {
                key: "PanCamControlScript",
                name: "PanCamera Control",
                description: "Enables camera to pan around a point in 3D space using the mouse",
                parameters: [{
                    key: "whenUsed",
                    type: "boolean",
                    name: "When Camera Used",
                    description: "Script only runs when the camera to which it is added is being used.",
                    "default": !0
                }, {
                    key: "panButton",
                    name: "Pan button",
                    description: "Only pan with this button",
                    type: "string",
                    control: "select",
                    "default": "Any",
                    options: ["Any", "Left", "Middle", "Right"]
                }, {
                    key: "panSpeed",
                    type: "float",
                    "default": 1,
                    scale: .01
                }]
            }, o
        }), define("goo/scriptpack/OrbitNPanControlScript", ["goo/scripts/Scripts", "goo/scripts/OrbitCamControlScript", "goo/scriptpack/PanCamScript", "goo/util/ObjectUtil"], function(e, t, n, r) {
            function i() {
                function s(e, t, n) {
                    r.setup(e, t, n), i.setup(e, t, n)
                }

                function o(e, t, n) {
                    i.update(e, t, n), r.update(e, t, n)
                }

                function u(e, t, n) {
                    i.cleanup(e, t, n), r.cleanup(e, t, n)
                }
                var r = e.create(t),
                    i = e.create(n);
                return {
                    setup: s,
                    cleanup: u,
                    update: o
                }
            }
            var s = t.externals.parameters,
                o = n.externals.parameters,
                u = r.deepClone(s.concat(o.slice(1)));
            for (var a = 0; a < u.length; a++) {
                var f = u[a];
                if (f.key === "panSpeed") {
                    u.splice(a, 1);
                    break
                }
            }
            for (var a = 0; a < u.length; a++) {
                var f = u[a];
                switch (f.key) {
                    case "dragButton":
                        f["default"] = "Left";
                        break;
                    case "panButton":
                        f["default"] = "Right";
                        break;
                    case "panSpeed":
                        f["default"] = 1
                }
            }
            return i.externals = {
                key: "OrbitNPanControlScript",
                name: "Orbit and Pan Control",
                description: "This is a combo of orbitcamcontrolscript and pancamcontrolscript",
                parameters: u
            }, i
        }), define("goo/scriptpack/PickAndRotateScript", [], function() {
            function e() {
                function s(e) {
                    var t = e.button;
                    return t === 0 && (e.altKey ? t = 2 : e.shiftKey && (t = 1)), t
                }

                function o(t) {
                    if (r.disable) return;
                    var i = s(t.domEvent);
                    if (i === e.dragButton || e.dragButton === -1) n = t.entity, u()
                }

                function u() {
                    var n = t.pickSync(i.x, i.y),
                        r = t.world.entityManager.getEntityByIndex(n.id);
                    i.down = r === e.entity
                }

                function a(e) {
                    i.ox = i.x, i.oy = i.y, i.x = e.clientX, i.y = e.clientY, i.dx = i.x - i.ox, i.dy = i.y - i.oy, n && i.down && (n.transformComponent.transform.rotation.fromAngles(i.y / -180, i.x / 180, 0), n.transformComponent.setUpdated())
                }

                function f() {
                    i.down = !1
                }

                function l(n, i) {
                    r = n, e = i, e.dragButton = ["Any", "Left", "Middle", "Right"].indexOf(r.dragButton) - 1, e.dragButton < -1 && (e.dragButton = -1), t = e.world.gooRunner, t.addEventListener("mousedown", o), t.renderer.domElement.addEventListener("mousemove", a), t.renderer.domElement.addEventListener("mouseup", f)
                }

                function c() {}

                function h(e, n) {
                    n.domElement.removeEventListener("mousemove", a, !1), n.domElement.removeEventListener("mouseup", f, !1), t.removeEventListener("mousedown", o)
                }
                var e, t, n, r, i = {
                    down: !1,
                    x: 0,
                    y: 0,
                    ox: 0,
                    oy: 0,
                    dx: 0,
                    dy: 0
                };
                return {
                    setup: l,
                    update: c,
                    cleanup: h
                }
            }
            return e.externals = {
                key: "PickAndRotateScript",
                name: "Pick and Rotate",
                description: "Enables pick-drag-rotating entities",
                parameters: [{
                    key: "disable",
                    description: "Prevent rotation. For preventing this script programmatically.",
                    type: "boolean",
                    "default": !1
                }, {
                    key: "dragButton",
                    description: "Button to enable dragging",
                    "default": "Any",
                    options: ["Any", "Left", "Middle", "Right"],
                    type: "string",
                    control: "select"
                }]
            }, e
        }), define("goo/scriptpack/PolyBoundingScript", [], function() {
            function e(e) {
                this.collidables = e || []
            }
            return e.prototype.addCollidable = function(e) {
                this.collidables.push(e)
            }, e.prototype.removeAllAt = function(e, t, n) {
                this.collidables = this.collidables.filter(function(r) {
                    if (r.bottom <= n && r.top >= n) return !window.PolyK.ContainsPoint(r.poly, e, t)
                })
            }, e.prototype.inside = function(e, t, n) {
                for (var r = 0; r < this.collidables.length; r++) {
                    var i = this.collidables[r];
                    if (i.bottom <= t && i.top >= t && window.PolyK.ContainsPoint(i.poly, e, n)) return window.PolyK.ClosestEdge(i.poly, e, n)
                }
            }, e.prototype.run = function(e) {
                var t = e.transformComponent,
                    n = t.transform.translation;
                for (var r = 0; r < this.collidables.length; r++) {
                    var i = this.collidables[r];
                    if (i.bottom <= n.data[1] && i.top >= n.data[1] && window.PolyK.ContainsPoint(i.poly, n.data[0], n.data[2])) {
                        var s = window.PolyK.ClosestEdge(i.poly, n.data[0], n.data[2]);
                        n.data[0] = s.point.x, n.data[2] = s.point.y, t.setUpdated();
                        return
                    }
                }
            }, e
        }), define("goo/scriptpack/RotationScript", [], function() {
            function e() {
                function r(r, i) {
                    e = {
                        x: 0,
                        y: 0
                    }, t = {
                        x: 0,
                        y: 0
                    }, n = i.entity, document.addEventListener("mousemove", s)
                }

                function i(r) {
                    t.x += (e.x - t.x) * r.fraction, t.y += (e.y - t.y) * r.fraction, n.setRotation(t.y / 200, t.x / 200, 0)
                }

                function s(t) {
                    e.x = t.x, e.y = t.y
                }

                function o() {
                    document.removeEventListener("mousemove", s)
                }
                var e, t, n;
                return {
                    setup: r,
                    update: i,
                    cleanup: o
                }
            }
            return e.externals = {
                key: "RotationScript",
                name: "Mouse Rotation",
                description: "",
                parameters: [{
                    key: "fraction",
                    name: "Speed",
                    "default": .01,
                    type: "float",
                    control: "slider",
                    min: .01,
                    max: 1
                }]
            }, e
        }), define("goo/scriptpack/ScriptComponentHandler", ["goo/loaders/handlers/ComponentHandler", "goo/entities/components/ScriptComponent", "goo/util/rsvp", "goo/util/ObjectUtil", "goo/util/PromiseUtil", "goo/entities/SystemBus", "goo/scripts/Scripts", "goo/scripts/ScriptUtils"], function(e, t, n, r, i, s, o, u) {
            function a() {
                e.apply(this, arguments), this._type = "ScriptComponent"
            }

            function f(e) {
                var t = o.create(e);
                if (!t) throw new Error("Unrecognized script name");
                return t.id = a.ENGINE_SCRIPT_PREFIX + e, t.enabled = !1, s.emit("goo.scriptExternals", {
                    id: t.id,
                    externals: t.externals
                }), i.resolve(t)
            }
            return a.prototype = Object.create(e.prototype), a.prototype.constructor = a, e._registerClass("script", a), a.ENGINE_SCRIPT_PREFIX = "GOO_ENGINE_SCRIPTS/", a.prototype._prepare = function() {}, a.prototype._create = function() {
                return new t
            }, a.prototype.update = function(t, i, s) {
                var o = this;
                return e.prototype.update.call(this, t, i, s).then(function(e) {
                    if (!e) return;
                    var t = [];
                    return r.forEach(i.scripts, function(e) {
                        var n = e.scriptRef,
                            i = n.indexOf(a.ENGINE_SCRIPT_PREFIX) === 0,
                            l = null;
                        if (i) {
                            var c = n.slice(a.ENGINE_SCRIPT_PREFIX.length);
                            l = f(c)
                        } else l = o._load(e.scriptRef, {
                            reload: !0
                        });
                        l = l.then(function(t) {
                            e.options = e.options || {}, t.parameters && r.defaults(e.options, t.parameters), t.externals && t.externals.parameters && u.fillDefaultValues(e.options, t.externals.parameters);
                            var n = Object.create(t);
                            return n.parameters = {}, n.enabled = !1, o._setParameters(n.parameters, e.options, t.externals, s).then(function() {
                                return n
                            })
                        }), t.push(l)
                    }, null, "sortValue"), n.all(t).then(function(t) {
                        return e.scripts = t, e
                    })
                })
            }, a.prototype._setParameters = function(e, t, r, s) {
                if (!r || !r.parameters) return i.resolve();
                var o = [];
                for (var u = 0; u < r.parameters.length; u++) {
                    var a = r.parameters[u];
                    this._setParameter(e, t[a.key], a, s)
                }
                return e.enabled = t.enabled !== undefined ? t.enabled : !0, n.all(o)
            }, a.prototype._setParameter = function(e, t, n, s) {
                var o = n.key;
                return n.type === "texture" ? !t || !t.textureRef || t.enabled === !1 ? (e[o] = null, i.resolve()) : this._load(t.textureRef, s).then(function(t) {
                    e[o] = t
                }) : n.type === "entity" ? !t || !t.entityRef || t.enabled === !1 ? (e[o] = null, i.resolve()) : this._load(t.entityRef, s).then(function(t) {
                    e[o] = t
                }) : (e[o] = r.extend(t), i.resolve())
            }, a
        }), define("goo/scriptpack/ScriptHandler", ["goo/loaders/handlers/ConfigHandler", "goo/util/rsvp", "goo/scripts/OrbitCamControlScript", "goo/scriptpack/OrbitNPanControlScript", "goo/scriptpack/FlyControlScript", "goo/scriptpack/WASDControlScript", "goo/scriptpack/BasicControlScript", "goo/util/PromiseUtil", "goo/util/ObjectUtil", "goo/entities/SystemBus", "goo/scripts/ScriptUtils", "goo/scripts/Scripts"], function(e, t, n, r, i, s, o, u, a, f, l, c) {
            function p() {
                e.apply(this, arguments), this._bodyCache = {}, this._dependencyPromises = {}, this._currentScriptLoading = null, this._addGlobalErrorListener()
            }

            function g(e, t) {
                var n = e.errors || [];
                if (typeof e.externals != "object") {
                    t.externals = {};
                    return
                }
                var r = e.externals;
                r.parameters && !(r.parameters instanceof Array) && n.push("externals.parameters needs to be an array");
                if (n.length) {
                    t.errors = n;
                    return
                }
                if (!r.parameters) return;
                t.externals.parameters = [];
                for (var i = 0; i < r.parameters.length; i++) {
                    var s = r.parameters[i];
                    if (typeof s.key != "string" || s.key.length === 0) {
                        n.push({
                            message: 'Parameter "key" needs to be a non-empty string.'
                        });
                        continue
                    }
                    if (s.name !== undefined && (typeof s.name != "string" || s.name.length === 0)) {
                        n.push({
                            message: 'Parameter "name" needs to be a non-empty string.'
                        });
                        continue
                    }
                    if (d.indexOf(s.type) === -1) {
                        n.push({
                            message: 'Parameter "type" needs to be one of: ' + d.join(", ") + "."
                        });
                        continue
                    }
                    if (s.control !== undefined && (typeof s.control != "string" || s.control.length === 0)) {
                        n.push({
                            message: 'Parameter "control" needs to be a non-empty string.'
                        });
                        continue
                    }
                    var o = v[s.type];
                    if (s.control !== undefined && o.indexOf(s.control) === -1) {
                        n.push({
                            message: 'Parameter "control" needs to be one of: ' + o.join(", ") + "."
                        });
                        continue
                    }
                    if (!(s.options === undefined || s.options instanceof Array)) {
                        n.push({
                            message: 'Parameter "key" needs to be array'
                        });
                        continue
                    }
                    if (s.min !== undefined && typeof s.min != "number") {
                        n.push({
                            message: 'Parameter "min" needs to be a number.'
                        });
                        continue
                    }
                    if (s.max !== undefined && typeof s.max != "number") {
                        n.push({
                            message: 'Parameter "max" needs to be a number.'
                        });
                        continue
                    }
                    if (s.scale !== undefined && typeof s.scale != "number") {
                        n.push({
                            message: 'Parameter "scale" needs to be a number.'
                        });
                        continue
                    }
                    if (s.decimals !== undefined && typeof s.decimals != "number") {
                        n.push({
                            message: 'Parameter "decimals" needs to be a number.'
                        });
                        continue
                    }
                    if (s.precision !== undefined && typeof s.precision != "number") {
                        n.push({
                            message: 'Parameter "precision" needs to be a number.'
                        });
                        continue
                    }
                    if (s.exponential !== undefined && typeof s.exponential != "boolean") {
                        n.push({
                            message: 'Parameter "exponential" needs to be a boolean.'
                        });
                        continue
                    }
                    if (s["default"] === null || s["default"] === undefined) s["default"] = l.defaultsByType[s.type];
                    t.externals.parameters.push(s)
                }
                n.length && (t.errors = n)
            }

            function y(e, t) {
                if (t.file) {
                    var n = t.message;
                    t.line && (n += " - on line " + t.line), e.dependencyErrors = e.dependencyErrors || {}, e.dependencyErrors[t.file] = t
                } else {
                    e.errors = e.errors || [];
                    var n = t.message;
                    t.line && (n += " - on line " + t.line), e.errors.push(t), e.setup = null, e.update = null, e.run = null, e.cleanup = null, e.parameters = {}, e.enabled = !1
                }
            }
            var h = 6e3;
            p.prototype = Object.create(e.prototype), p.prototype.constructor = p, e._registerClass("script", p), p.prototype._create = function() {
                return {
                    externals: {},
                    setup: null,
                    update: null,
                    run: null,
                    cleanup: null,
                    parameters: {},
                    name: null
                }
            }, p.prototype._remove = function(e) {
                var t = this._objects[e];
                if (t && t.cleanup && t.context) try {
                    t.cleanup(t.parameters, t.context, c.getClasses())
                } catch (n) {}
                delete this._objects[e], delete this._bodyCache[e]
            }, p.prototype._updateFromCustom = function(e, t) {
                if (this._bodyCache[t.id] === t.body) return e;
                delete e.errors, this._bodyCache[t.id] = t.body;
                var n = document.getElementById(p.DOM_ID_PREFIX + t.id);
                n && n.parentNode.removeChild(n), window._gooScriptFactories || (window._gooScriptFactories = {});
                var r = ["window._gooScriptFactories['" + t.id + "'] = function () { ", t.body, " var obj = {", "  externals: {}", " };", ' if (typeof parameters !== "undefined") {', "  obj.externals.parameters = parameters;", " }", ' if (typeof setup !== "undefined") {', "  obj.setup = setup;", " }", ' if (typeof cleanup !== "undefined") {', "  obj.cleanup = cleanup;", " }", ' if (typeof update !== "undefined") {', "  obj.update = update;", " }", " return obj;", "};"].join("\n"),
                    i = document.createElement("script");
                i.id = p.DOM_ID_PREFIX + t.id, i.innerHTML = r, i.async = !1, this._currentScriptLoading = t.id, document.body.appendChild(i);
                var s = window._gooScriptFactories[t.id];
                if (s) {
                    try {
                        s = s(), e.id = t.id, g(s, e), e.setup = s.setup, e.update = s.update, e.cleanup = s.cleanup, e.parameters = {}, e.enabled = !1
                    } catch (o) {
                        var u = {
                                message: o.toString()
                            },
                            a = o.stack.split("\n")[1].match(/(\d+):\d+\)$/);
                        a && (u.line = parseInt(a[1], 10) - 1), y(e, u)
                    }
                    this._currentScriptLoading = null
                }
                return e.externals && l.fillDefaultNames(e.externals.parameters), e
            }, p.prototype._updateFromClass = function(e, t) {
                if (!e.externals || e.externals.name !== t.className) {
                    var n = c.create(t.className);
                    if (!n) throw new Error("Unrecognized script name");
                    e.id = t.id, e.externals = n.externals, e.setup = n.setup, e.update = n.update, e.run = n.run, e.cleanup = n.cleanup, e.parameters = n.parameters || {}, e.enabled = !1, l.fillDefaultNames(e.externals.parameters)
                }
                return e
            }, p.prototype._update = function(n, r, i) {
                var s = this;
                return e.prototype._update.call(this, n, r, i).then(function(e) {
                    if (!e) return;
                    var o = [];
                    return r.body && r.dependencies && (delete e.dependencyErrors, a.forEach(r.dependencies, function(t) {
                        o.push(s._addDependency(e, t.url, r.id))
                    }, null, "sortValue")), t.all(o).then(function() {
                        return r.className ? s._updateFromClass(e, r, i) : r.body && s._updateFromCustom(e, r, i), r.body && f.emit("goo.scriptExternals", {
                            id: r.id,
                            externals: e.externals
                        }), e.name = r.name, e.errors || e.dependencyErrors ? (f.emit("goo.scriptError", {
                            id: n,
                            errors: e.errors,
                            dependencyErrors: e.dependencyErrors
                        }), e) : (f.emit("goo.scriptError", {
                            id: n,
                            errors: null
                        }), a.extend(e.parameters, r.options), e)
                    })
                })
            }, p.prototype._addDependency = function(e, t, n) {
                var r = this;
                t.charAt(0) !== "/" && (t = t.substr(t.indexOf("//")));
                var i = document.querySelector('script[src="' + t + '"]');
                return i ? this._dependencyPromises[t] || u.resolve() : (i = document.createElement("script"), i.src = t, i.setAttribute("data-script-id", n), document.body.appendChild(i), this._dependencyPromises[t] = u.createPromise(function(n, s) {
                    function o(s) {
                        var o = {
                            message: s,
                            file: t
                        };
                        y(e, o), i.parentNode.removeChild(i), n(), delete r._dependencyPromises[t]
                    }
                    i.onload = function() {
                        n(), delete r._dependencyPromises[t]
                    }, i.onerror = function(e) {
                        console.error(e), o("Could not load dependency")
                    }, setTimeout(function() {
                        o("Loading dependency failed (time out).")
                    }, h)
                }))
            }, p.prototype._addGlobalErrorListener = function() {
                var e = this;
                window.addEventListener("error", function(t) {
                    if (t.filename) {
                        var n = document.querySelector('script[src="' + t.filename + '"]');
                        if (n) {
                            var r = n.getAttribute("data-script-id"),
                                i = e._objects[r];
                            if (i) {
                                var s = {
                                    message: t.message,
                                    line: t.lineno,
                                    file: t.filename
                                };
                                y(i, s)
                            }
                            n.parentNode.removeChild(n)
                        }
                    }
                    if (e._currentScriptLoading) {
                        var o = document.getElementById(p.DOM_ID_PREFIX + e._currentScriptLoading);
                        o && o.parentNode.removeChild(o), delete window._gooScriptFactories[e._currentScriptLoading];
                        var i = e._objects[e._currentScriptLoading],
                            s = {
                                message: t.message,
                                line: t.lineno - 1
                            };
                        y(i, s), e._currentScriptLoading = null
                    }
                })
            };
            var d = ["string", "int", "float", "vec3", "vec4", "boolean", "texture", "image", "sound", "camera", "entity", "animation"],
                v = {
                    string: ["key"],
                    "int": ["spinner", "slider", "jointSelector"],
                    "float": ["spinner", "slider"],
                    vec3: ["color"],
                    vec4: ["color"],
                    "boolean": ["checkbox"],
                    texture: [],
                    image: [],
                    sound: [],
                    camera: [],
                    entity: [],
                    animation: []
                };
            for (var m in v) Array.prototype.push.apply(v[m], ["dropdown", "select"]);
            return p.DOM_ID_PREFIX = "_script_", p
        }), define("goo/scriptpack/ScriptRegister", ["goo/scripts/Scripts", "goo/scripts/OrbitCamControlScript", "goo/scriptpack/OrbitNPanControlScript", "goo/scriptpack/FlyControlScript", "goo/scriptpack/AxisAlignedCamControlScript", "goo/scriptpack/PanCamScript", "goo/scriptpack/MouseLookControlScript", "goo/scriptpack/WASDControlScript", "goo/scriptpack/ButtonScript", "goo/scriptpack/PickAndRotateScript", "goo/scriptpack/LensFlareScript"], function(e) {
            for (var t = 1; t < arguments.length; t++) e.register(arguments[t]), e.addClass(arguments[t].name, arguments[t])
        }), define("goo/scriptpack/SparseHeightMapBoundingScript", [], function() {
            function e(e) {
                this.elevationData = e
            }
            return e.prototype.getClosest = function(e, t) {
                var n = Number.MAX_VALUE,
                    r = -1;
                for (var i = 0; i < this.elevationData.length; i += 3) {
                    var s = Math.pow(this.elevationData[i + 0] - e, 2) + Math.pow(this.elevationData[i + 2] - t, 2);
                    s < n && (n = s, r = i)
                }
                return this.elevationData[r + 1]
            }, e.prototype.run = function(e) {
                var t = e.transformComponent.transform.translation,
                    n = this.getClosest(t.data[0], t.data[2]),
                    r = t.data[1] - n;
                t.data[1] -= r * .1
            }, e
        }), define("goo/scriptpack/WorldFittedTerrainScript", ["goo/scriptpack/HeightMapBoundingScript", "goo/math/Vector3"], function(e, t) {
            function s(e, t) {
                if (e.minX > e.maxX) throw {
                    name: "Terrain Exception",
                    message: "minX is larger than maxX"
                };
                if (e.minY > e.maxY) throw {
                    name: "Terrain Exception",
                    message: "minY is larger than maxY"
                };
                if (e.minZ > e.maxZ) throw {
                    name: "Terrain Exception",
                    message: "minZ is larger than maxZ"
                };
                if (!t) throw {
                    name: "Terrain Exception",
                    message: "No heightmap data specified"
                };
                if (t.length !== t[0].length) throw {
                    name: "Terrain Exception",
                    message: "Heightmap data is not a square"
                };
                return !0
            }

            function o(t, n, r) {
                n = n || i, s(n, t, r);
                var o = {
                    dimensions: n,
                    sideQuadCount: t.length - 1,
                    script: new e(t)
                };
                return o
            }

            function u() {
                this.heightMapData = [], this.yMargin = 1
            }
            var n = new t,
                r = new t,
                i = {
                    minX: 0,
                    maxX: 100,
                    minY: 0,
                    maxY: 50,
                    minZ: 0,
                    maxZ: 100
                };
            return u.prototype.addHeightData = function(e, t) {
                var n = o(e, t, this.heightMapData);
                return this.heightMapData.push(n), n
            }, u.prototype.getHeightDataForPosition = function(e) {
                for (var t = 0; t < this.heightMapData.length; t++) {
                    var n = this.heightMapData[t].dimensions;
                    if (e[0] <= n.maxX && e[0] >= n.minX && e[1] < n.maxY + this.yMargin && e[1] > n.minY - this.yMargin && e[2] <= n.maxZ && e[2] >= n.minZ) return this.heightMapData[t]
                }
                return null
            }, u.prototype.displaceAxisDimensions = function(e, t, n, r) {
                var i = e - t;
                return r * i / (n - t)
            }, u.prototype.returnToWorldDimensions = function(e, t, n, r) {
                var i = (n - t) / r,
                    s = e * i;
                return t + s
            }, u.prototype.getTerrainHeightAt = function(e) {
                var t = this.getHeightDataForPosition(e);
                if (t === null) return null;
                var n = t.dimensions,
                    r = this.displaceAxisDimensions(e[0], n.minX, n.maxX, t.sideQuadCount),
                    i = this.displaceAxisDimensions(e[2], n.minZ, n.maxZ, t.sideQuadCount),
                    s = t.script.getPreciseHeight(r, i);
                return s * (n.maxY - n.minY) + n.minY
            }, u.prototype.getTerrainNormalAt = function(e) {
                var t = this.getHeightDataForPosition(e);
                if (!t) return null;
                var i = t.dimensions,
                    s = this.displaceAxisDimensions(e[0], i.minX, i.maxX, t.sideQuadCount),
                    o = this.displaceAxisDimensions(e[2], i.minZ, i.maxZ, t.sideQuadCount),
                    u = t.script.getTriangleAt(s, o);
                for (var a = 0; a < u.length; a++) u[a].x = this.returnToWorldDimensions(u[a].x, i.minX, i.maxX, t.sideQuadCount), u[a].z = this.returnToWorldDimensions(u[a].z, i.minY, i.maxY, 1), u[a].y = this.returnToWorldDimensions(u[a].y, i.minZ, i.maxZ, t.sideQuadCount);
                return n.set(u[1].x - u[0].x, u[1].z - u[0].z, u[1].y - u[0].y), r.set(u[2].x - u[0].x, u[2].z - u[0].z, u[2].y - u[0].y), n.cross(r), n.data[1] < 0 && n.muld(-1, -1, -1), n.normalize(), n
            }, u
        }), require(["goo/scriptpack/AxisAlignedCamControlScript", "goo/scriptpack/BasicControlScript", "goo/scriptpack/ButtonScript", "goo/scriptpack/CannonPickScript", "goo/scriptpack/FlyControlScript", "goo/scriptpack/GroundBoundMovementScript", "goo/scriptpack/HeightMapBoundingScript", "goo/scriptpack/LensFlareScript", "goo/scriptpack/MouseLookControlScript", "goo/scriptpack/OrbitNPanControlScript", "goo/scriptpack/PanCamScript", "goo/scriptpack/PickAndRotateScript", "goo/scriptpack/PolyBoundingScript", "goo/scriptpack/RotationScript", "goo/scriptpack/ScriptComponentHandler", "goo/scriptpack/ScriptHandler", "goo/scriptpack/ScriptRegister", "goo/scriptpack/SparseHeightMapBoundingScript", "goo/scriptpack/WASDControlScript", "goo/scriptpack/WorldFittedTerrainScript"], function(e, t, n, r, i, s, o, u, a, f, l, c, h, p, d, v, m, g, y, b) {
            var w = window.goo;
            if (!w) return;
            w.AxisAlignedCamControlScript = e, w.BasicControlScript = t, w.ButtonScript = n, w.CannonPickScript = r, w.FlyControlScript = i, w.GroundBoundMovementScript = s, w.HeightMapBoundingScript = o, w.LensFlareScript = u, w.MouseLookControlScript = a, w.OrbitNPanControlScript = f, w.PanCamScript = l, w.PickAndRotateScript = c, w.PolyBoundingScript = h, w.RotationScript = p, w.ScriptComponentHandler = d, w.ScriptHandler = v, w.ScriptRegister = m, w.SparseHeightMapBoundingScript = g, w.WASDControlScript = y, w.WorldFittedTerrainScript = b
        }), define("goo/scriptpack/scriptpack", function() {});
    }
    try {
        if (window.localStorage && window.localStorage.gooPath) {
            window.require.config({
                paths: {
                    goo: localStorage.gooPath
                }
            });
        } else f()
    } catch (e) {
        f()
    }
})(window)