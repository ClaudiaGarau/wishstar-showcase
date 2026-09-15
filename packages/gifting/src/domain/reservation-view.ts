export interface ReservationView {
  status: "available" | "reserved";
  /** The only identity signal ever exposed, and only to the person it's true for — nobody, including the owner, ever learns who else reserved it. */
  reservedByMe: boolean;
}
