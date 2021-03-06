﻿import { Component, ViewEncapsulation, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs/Subscription";
import { RoutesService } from "../services/layers/routelayers/routes.service";
import { ResourcesService } from "../services/resources.service";
import { RouteStatisticsService } from "../services/route-statistics.service";
import { BaseMapComponent } from "./base-map.component";

@Component({
    selector: "route-statistics",
    templateUrl: "./route-statistics.component.html",
    encapsulation: ViewEncapsulation.None
})
export class RouteStatisticsComponent extends BaseMapComponent implements OnInit, OnDestroy {
    public length: number;
    public gain: number;
    public loss: number;

    private routeChangedSubscription: Subscription;
    private routeDataChangedSubscription: Subscription;

    constructor(resources: ResourcesService,
        private routesService: RoutesService,
        private routeStatisticsService: RouteStatisticsService) {
        super(resources);

        this.initalizeStatistics();
        this.routeChangedSubscription = null;
        this.routeDataChangedSubscription = null;

    }

    private initalizeStatistics(): void {
        this.length = 0;
        this.gain = 0;
        this.loss = 0;
    }

    public ngOnInit() {
        this.routeChangedSubscription = this.routesService.routeChanged.subscribe(() => {
            this.routeChanged();
        });
        this.routeChanged();
    }

    public ngOnDestroy() {
        this.routeChangedSubscription.unsubscribe();
        if (this.routeDataChangedSubscription) {
            this.routeDataChangedSubscription.unsubscribe();
        }
    }

    public getUnits = (number: number): string => {
        return Math.abs(number) > 1000 ? this.resources.kmUnit : this.resources.meterUnit;
    }

    public toShortNumber = (number: number): string => {
        if (number == null) {
            return "0";
        }
        return Math.abs(number) > 1000 ? (number / 1000.0).toFixed(2) : number.toFixed(0);
    }

    public toggle(e: Event): void {
        this.suppressEvents(e);
        this.routeStatisticsService.toggle();
    }

    public isVisible(): boolean {
        return this.routeStatisticsService.isVisible();
    }

    private routeChanged() {
        if (this.routeDataChangedSubscription) {
            this.routeDataChangedSubscription.unsubscribe();
        }
        let routeLayer = this.routesService.selectedRoute;
        if (!routeLayer) {
            this.initalizeStatistics();
            return;
        }
        this.routeDataChangedSubscription = routeLayer.dataChanged.subscribe(() => this.onRouteDataChanged());
        this.onRouteDataChanged();
    }

    private onRouteDataChanged() {
        let statistics = this.routeStatisticsService.getStatistics(this.routesService.selectedRoute.getData());
        this.length = statistics.length;
        this.gain = statistics.gain;
        this.loss = statistics.loss;
    }
}