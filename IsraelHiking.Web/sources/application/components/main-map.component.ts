﻿import { Component, Injector, Type, ComponentFactoryResolver, ApplicationRef } from "@angular/core";
import { Location, LocationStrategy, PathLocationStrategy } from "@angular/common";
import * as L from "leaflet";

import { ResourcesService } from "../services/resources.service";
import { MapService } from "../services/map.service";
import { SidebarService } from "../services/sidebar.service";
import { RouteStatisticsService } from "../services/route-statistics.service";
import { ToastService } from "../services/toast.service";
import { DragAndDropService } from "../services/drag-and-drop.service";
import { BaseMapComponent } from "./base-map.component";
import { ZoomComponent } from "./zoom.component";
import { LocationComponent } from "./location.component";
import { LayersComponent } from "./layers.component";
import { FileComponent } from "./file.component";
import { FileSaveAsComponent } from "./file-save-as.component";
import { EditOSMComponent } from "./edit-osm.component";
import { RouteStatisticsComponent } from "./route-statistics.component";
import { OsmUserComponent } from "./osm-user.component";
import { LanguageComponent } from "./language.component";
import { DrawingComponent } from "./drawing.component";
import { SearchComponent } from "./search.component";
import { InfoComponent } from "./info.component";
import { ShareComponent } from "./share.component";
import { IhmLinkComponent } from "./ihm-link.component";

@Component({
    template: `<ng-progress [ngStyle]="{'z-index':1500}"></ng-progress>`,
    selector: "main-map",
    providers: [Location, { provide: LocationStrategy, useClass: PathLocationStrategy }],
})
export class MainMapComponent extends BaseMapComponent {

    constructor(resources: ResourcesService,
        private readonly location: Location,
        private readonly injector: Injector,
        private readonly componentFactoryResolver: ComponentFactoryResolver,
        private readonly mapService: MapService,
        private readonly sidebarService: SidebarService,
        private readonly routeStatisticsService: RouteStatisticsService,
        private readonly applicationRef: ApplicationRef,
        private readonly toastService: ToastService,
        // needed for initialization
        dragAndDropService: DragAndDropService,
    ) {
        super(resources);
        this.createControls();
    }

    public getIsSidebarVisible() {
        return this.sidebarService.isVisible;
    }

    public closeSidebar() {
        this.sidebarService.hide();
    }

    private createControls() {
        this.createContorl("zoom-control", ZoomComponent, "topleft", true);
        this.createContorl("location-control", LocationComponent);
        this.createContorl("layer-control", LayersComponent);
        this.createContorl("file-control", FileComponent);
        this.createContorl("save-as-control", FileSaveAsComponent);
        this.createContorl("edit-osm-control", EditOSMComponent, "topleft", true);
        this.createContorl("info-control", InfoComponent);
        this.createContorl("osm-user-control", OsmUserComponent, "topright");
        this.createContorl("search-control", SearchComponent, "topright");
        this.createContorl("drawing-control", DrawingComponent, "topright");
        this.createContorl("share-control", ShareComponent, "topright");
        this.createContorl("language-control", LanguageComponent, "topright");
        this.createContorl("ihm-link-control", IhmLinkComponent, "bottomleft");
        this.createContorl("route-statistics-control", RouteStatisticsComponent, "bottomright");

        L.control.scale({ imperial: false, position: "bottomright" } as L.Control.ScaleOptions).addTo(this.mapService.map);
    }

    private createContorl<T>(directiveHtmlName: string, component: Type<T>, position: L.ControlPosition = "topleft", hiddenOnMoblie = false) {
        var control = L.Control.extend({
            options: {
                position: position
            } as L.ControlOptions,
            onAdd: (): HTMLElement => {
                let classString = directiveHtmlName + "-container";
                if (hiddenOnMoblie) {
                    classString += " hidden-xs";
                }
                let controlDiv = L.DomUtil.create("div", classString);
                let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
                let componentRef = componentFactory.create(this.injector, [], controlDiv);
                this.applicationRef.attachView(componentRef.hostView);
                L.DomEvent.disableClickPropagation(controlDiv);
                return controlDiv;
            },
            onRemove: () => { }
        } as L.ControlOptions);
        new control().addTo(this.mapService.map);
    }
} 
