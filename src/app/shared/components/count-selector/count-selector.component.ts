import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "count-selector",
  templateUrl: "./count-selector.component.html",
  styleUrls: ["./count-selector.component.scss"],
})
export class CountSelectorComponent implements OnInit {
  @Input() count: number = 1;
  constructor() {}

  @Output() onCountChange: EventEmitter<number> = new EventEmitter<number>();

  ngOnInit(): void {}

  countChange() {
    this.onCountChange.emit(this.count);
  }

  decreaseCount() {
    if (this.count > 1) {
      this.count--;
      this.countChange();
    }
  }

  increaseCount() {
    this.count++;
    this.countChange();
  }
}
