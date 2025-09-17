import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function Prejoin() {

  return (
    <Card className="shadow-2xl bg-slate-800/95 border-gray-700/30 backdrop-blur-xl">
      <CardContent className="p-10">
        <div className="text-center text-white">
          <h2 className="text-2xl font-semibold mb-4">Join Meeting</h2>
          <Button className="bg-green-600 hover:bg-green-700 text-white">
            Join Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
