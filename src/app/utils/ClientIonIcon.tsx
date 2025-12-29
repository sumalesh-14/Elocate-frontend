"use client";
import React, { useEffect, useState } from "react";
import { IonIcon } from "@ionic/react";

const ClientIonIcon = (props: any) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return <IonIcon {...props} />;
};

export default ClientIonIcon;
